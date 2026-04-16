/**
 * Vapi Agent Configuration & Creation Script
 *
 * Run this once to register the assistant with Vapi:
 *   VAPI_API_KEY=your_key BACKEND_URL=https://your-url.ngrok.io npx tsx vapi-config/agent-config.ts
 *
 * It will print the VAPI_ASSISTANT_ID to set in your .env.local
 */

import dotenv from "dotenv";
dotenv.config({ path: "../backend/.env" });

const VAPI_API_KEY = process.env.VAPI_API_KEY || "";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

if (!VAPI_API_KEY || VAPI_API_KEY === "your_vapi_api_key_here") {
  console.warn("⚠️  VAPI_API_KEY is not set. This script requires a real Vapi API key.");
  console.warn("   Export it: export VAPI_API_KEY=your_key_here\n");
  console.log("📋 Printing assistant config for manual use instead:\n");
}

// ─── Tool Definitions ─────────────────────────────────────────────────────────

const tools = [
  {
    type: "function",
    function: {
      name: "update_form_field",
      description:
        "Call this whenever you have successfully extracted a specific piece of information from the user's answer. Send the field name and the extracted value. This updates the form in real time.",
      parameters: {
        type: "object",
        properties: {
          field: {
            type: "string",
            enum: [
              "fullName", "age", "gender", "aadhaarNumber",
              "village", "district", "state",
              "landSizeAcres", "cropType", "irrigationType",
              "annualIncome", "bankAccountNumber", "hasBusiness",
              "businessName", "businessType", "businessIncome",
            ],
            description: "The exact form field name to update.",
          },
          value: {
            type: "string",
            description: "The extracted value. Use boolean false for hasBusiness when user says they have no business.",
          },
        },
        required: ["field", "value"],
      },
    },
    server: {
      url: `${BACKEND_URL}/webhook/vapi`,
    },
  },
  {
    type: "function",
    function: {
      name: "ask_knowledge_base",
      description:
        "Call this when the user asks any question regarding financial, legal, agricultural terms, government schemes, security tips, or how to use the platform. This will fetch a detailed answer from the Sahayak/VaaniPay knowledge base.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The full question or topic the user is asking about.",
          },
        },
        required: ["query"],
      },
    },
    server: {
      url: `${BACKEND_URL}/webhook/vapi`,
    },
  },
  {
    type: "function",
    function: {
      name: "save_user_data",
      description:
        "Call this at the end of the conversation, or when the user confirms all their data, to save their profile for future sessions.",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string", description: "Unique identifier for this user (use their Aadhaar number or phone)." },
          form: {
            type: "object",
            description: "The collected form data as a JSON object.",
          },
        },
        required: ["userId", "form"],
      },
    },
    server: {
      url: `${BACKEND_URL}/webhook/vapi`,
    },
  },
  {
    type: "function",
    function: {
      name: "retrieve_user_memory",
      description:
        "Call this at the START of a new call when the user provides their name or ID, to check if we have their past information saved.",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string", description: "The user's identifier (Aadhaar or phone number)." },
        },
        required: ["userId"],
      },
    },
    server: {
      url: `${BACKEND_URL}/webhook/vapi`,
    },
  },
];

// ─── System Prompt ────────────────────────────────────────────────────────────

const systemPrompt = `You are Sahayak, an empathetic and patient AI caseworker powered by VaaniPay, helping low-literacy farmers and rural families fill out government subsidy and microfinance application forms in India.

PERSONALITY GUIDELINES:
- Speak in a warm, respectful, and simple manner — like a trusted local helper.
- Use simple everyday analogies, never bureaucratic jargon.
- Celebrate small victories ("Wonderful! I've noted your land size.").
- Be patient — if the user gives unclear answers, gently rephrase the question in a different, simpler way.
- Speak slowly and clearly.
- If the user seems confused, offer a brief example from their daily life.

CONVERSATION FLOW:
1. START: Greet the user warmly. Ask for their name and whether they have filled a form with you before.
2. If returning: Call retrieve_user_memory with their ID. If found, read back their old info and ask if it's still correct.
3. If new: Begin collecting form fields in this order:
   - Personal: full name, age, gender, Aadhaar number
   - Location: village, district, state
   - Agriculture: land size in acres, crop type, irrigation type
   - Financial: annual income, bank account number
   - Business: FIRST ask "Do you run any kind of shop, business, or trade?" 
     - If NO → Call update_form_field with field="hasBusiness" value=false. Move on.
     - If YES → Collect businessName, businessType, businessIncome.
4. END: Summarise everything collected, thank them, and call save_user_data.

CRITICAL RULES:
- After extracting any piece of information, ALWAYS call update_form_field immediately with the extracted value.
- After EVERY field you collect, read it back to the user and ask "Is that correct?" before moving to the next question. Only proceed after they confirm.
- NEVER ask multiple questions at once. One field at a time.
- **KNOWLEDGE BASE**: If the user asks ANY question about anything (e.g., "What is PM Kisan?", "Is my data safe?", "How do I repay?", "What does collateral mean?"), call ask_knowledge_base immediately. Voice the explanation returned, then continue where you left off.
- **NAME CLARIFICATION**: Indian names can sometimes be misrecognized by digital systems. If a name sounds like a common English word (e.g., "Ambulance"), gently ask the user to repeat it. If it remains unclear, ask the user to spell it out letter by letter (e.g., "R-A-M-E-S-H"). Acknowledge each letter as they spell it.
- If the user provides Aadhaar, read it back in groups of 4 digits to confirm.
- **MULTILINGUAL MODE**: You are capable of speaking and understanding Hindi, Kannada, Tamil, and Telugu. Detect the user's language and respond comfortably in that language. 
- **ENGLISH REGISTRY**: Regardless of the language you speak with the user, ALWAYS record and update form fields using English values (e.g., if the user says 'Ek' for age, update with '1').
- Always speak in the first person as Sahayak.`;

// ─── Full Assistant Config ────────────────────────────────────────────────────

export const assistantConfig = {
  name: "VaaniPay Sahayak — Agri Form Assistant",
  voice: {
    provider: "11labs",
    voiceId: "21m00Tcm4TlvDq8ikWAM",
  },
  model: {
    provider: "groq", 
    model: "llama3-70b-8192", 
    systemPrompt,
    tools,
    temperature: 0.3,
  },
  firstMessage:
    "Namaste! I am Sahayak, your helper for filling out your government form. This will take about 5 minutes and I will guide you every step of the way. May I know your name, and have you spoken with me before?",
  serverUrl: `${BACKEND_URL}/webhook/vapi`,
  silenceTimeoutSeconds: 30,
  maxDurationSeconds: 1800,
  backgroundSound: "off",
  backchannelingEnabled: true,
  endCallFunctionEnabled: false,
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "multi",
    smartFormat: true,
    keywords: [
      "aadhaar", "kisan", "pmkisan", "karnataka", "bengaluru", "tumkur", 
      "hoskote", "ramesh", "suresh", "kcc", "subsidy", "kharif", "rabi",
      "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
    ],
  },
};

// ─── Create Assistant via Vapi REST API ───────────────────────────────────────

async function createAssistant() {
  if (!VAPI_API_KEY || VAPI_API_KEY === "your_vapi_api_key_here") {
    console.log(JSON.stringify(assistantConfig, null, 2));
    return;
  }

  try {
    const response = await fetch("https://api.vapi.ai/assistant", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(assistantConfig),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Vapi API error ${response.status}: ${error}`);
    }

    const assistant = await response.json() as { id: string; name: string };
    console.log("✅ Vapi assistant created successfully!\n");
    console.log(`   Assistant ID: ${assistant.id}`);
    console.log(`   Name: ${assistant.name}`);
    console.log("\n📋 Add this to frontend/.env.local:");
    console.log(`   NEXT_PUBLIC_VAPI_ASSISTANT_ID=${assistant.id}`);
  } catch (err) {
    console.error("❌ Failed to create assistant:", err);
  }
}

createAssistant();
