import { Router, Request, Response } from "express";
import type { FormUpdateEvent, FormFieldKey, AgriSubsidyForm } from "../types.js";

const router = Router();

// ─── SSE Client Registry ──────────────────────────────────────────────────────
// Maps sessionId → Express Response (SSE stream)
export const sseClients = new Map<string, Response>();

// Tracks skipped fields per session (non-linear conversation flow)
const skippedFields = new Map<string, Set<FormFieldKey>>();

// Business-related fields to skip when hasBusiness = false
const BUSINESS_FIELDS: FormFieldKey[] = ["businessName", "businessType", "businessIncome"];

/**
 * GET /api/form-events?sessionId=xxx
 * Establishes an SSE stream for the frontend to listen to form updates.
 */
router.get("/form-events", (req: Request, res: Response) => {
  const sessionId = (req.query.sessionId as string) || "default";

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // Register client
  sseClients.set(sessionId, res);
  console.log(`📡 SSE client connected: ${sessionId} (${sseClients.size} total)`);

  // Send heartbeat every 25 seconds to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 25000);

  // Send initial connected event
  sendSSE(res, { type: "status", message: "connected", sessionId });

  req.on("close", () => {
    clearInterval(heartbeat);
    sseClients.delete(sessionId);
    console.log(`📡 SSE client disconnected: ${sessionId}`);
  });
});

/**
 * POST /webhook/vapi
 * Receives function call events from Vapi and dispatches SSE updates.
 */
router.post("/webhook/vapi", async (req: Request, res: Response) => {
  const body = req.body;
  const message = body?.message;
  const type = message?.type;

  // Global log for ALL Vapi traffic to diagnose tunnel/data issues
  console.log(`📡 Vapi Webhook Received [Type: ${type}, MsgID: ${body?.messageId || 'N/A'}]`);
  
  if (type === "function-call") {
    console.log(`📦 Full Call Object: ${JSON.stringify(message?.call, null, 2)}`);
  }

  // Handle both legacy 'function-call' and modern 'tool-calls'
  if (type === "function-call" || type === "tool-calls") {
    const callId = message?.call?.id || "default";

    // Robust sessionId extraction
    const sessionId = 
      message?.call?.metadata?.sessionId || 
      message?.customer?.metadata?.sessionId || 
      body?.metadata?.sessionId || 
      callId;

    console.log(`📡 Webhook [${type}] received for Session: ${sessionId}`);

    // Process all calls (Vapi can send multiple tools in one tool-calls message)
    const calls = type === "tool-calls" ? (message?.toolCalls || []) : [message?.functionCall];
    const results: any[] = [];

    for (const call of calls) {
      const functionName = type === "tool-calls" ? call?.function?.name : call?.name;
      const parameters = type === "tool-calls" ? (JSON.parse(call?.function?.arguments || "{}")) : (call?.parameters || {});
      
      console.log(`🛠️  Executing tool: ${functionName}`);
      let toolResult: unknown = { success: true };

      switch (functionName) {
        case "update_form_field": {
          const { field, value } = parameters as { field: FormFieldKey; value: string | number | boolean };
          toolResult = handleFormFieldUpdate(sessionId, field, value);
          break;
        }

        case "ask_knowledge_base": {
          const { query } = parameters as { query: string };
          // ... (Knowledge search logic remains same)
          try {
            const { qdrantClient, COLLECTION_KNOWLEDGE } = await import("../services/qdrant.js");
            const { getEmbedding, zeroVector } = await import("../services/embeddings.js");
            const vector = process.env.OPENAI_API_KEY ? await getEmbedding(query) : zeroVector();
            const searchResults = await qdrantClient.search(COLLECTION_KNOWLEDGE, { vector, limit: 1, with_payload: true });
            toolResult = searchResults.length > 0 ? { answer: (searchResults[0].payload as any).content } : { answer: "No matching info found." };
          } catch (err) {
            toolResult = { error: "Search failed" };
          }
          break;
        }

        case "save_user_data":
        case "retrieve_user_memory":
          toolResult = { acknowledged: true };
          break;

        default:
          console.warn(`⚠️  Unknown tool: ${functionName}`);
          toolResult = { error: "Unknown tool" };
      }

      // Format result based on Vapi version
      if (type === "tool-calls") {
        results.push({ toolCallId: call.id, result: JSON.stringify(toolResult) });
      } else {
        results.push(toolResult);
      }
    }

    // Send response back to Vapi
    if (type === "tool-calls") {
      res.json({ results });
    } else {
      res.json({ result: JSON.stringify(results[0]) });
    }
    return;
  }

  // Handle end-of-call summary (save final form state)
  if (type === "end-of-call-report") {
    console.log("📋 End of call report received");
    res.json({ received: true });
    return;
  }

  res.json({ received: true });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function handleFormFieldUpdate(
  sessionId: string,
  field: FormFieldKey,
  value: string | number | boolean
): { success: boolean; skipped?: FormFieldKey[] } {
  const client = sseClients.get(sessionId);

  // Handle non-linear skipping logic
  if (field === "hasBusiness" && value === false) {
    if (!skippedFields.has(sessionId)) skippedFields.set(sessionId, new Set());
    const skip = skippedFields.get(sessionId)!;
    BUSINESS_FIELDS.forEach((f) => skip.add(f));

    // Notify frontend to hide business section
    if (client) {
      sendSSE(client, { type: "form_update", field: "hasBusiness", value: false, sessionId });
      BUSINESS_FIELDS.forEach((f) => {
        sendSSE(client, { type: "form_update", field: f, value: "__skipped__", sessionId });
      });
    }

    return { success: true, skipped: BUSINESS_FIELDS };
  }

  // Normal field update
  if (client) {
    const event: FormUpdateEvent = { type: "form_update", field, value, sessionId };
    sendSSE(client, event);
  }

  return { success: true };
}

function sendSSE(res: Response, data: unknown): void {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export { sendSSE };
export default router;
