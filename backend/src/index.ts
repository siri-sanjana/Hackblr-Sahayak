import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initCollections } from "./services/qdrant.js";
import vapiRouter from "./routes/vapi.js";
import knowledgeRouter from "./routes/knowledge.js";
import memoryRouter from "./routes/memory.js";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "4000", 10);

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/", vapiRouter);              // /api/form-events (SSE), /webhook/vapi (webhook)
app.use("/api", knowledgeRouter);      // /api/ask-knowledge
app.use("/api/user-memory", memoryRouter); // /api/user-memory/*

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Start ────────────────────────────────────────────────────────────────────
async function start() {
  try {
    console.log("🔧 Initializing Qdrant collections (Required)...");
    await initCollections();
    console.log("✅ Qdrant connection established.");
  } catch (err) {
    console.error("❌ CRITICAL ERROR: Qdrant vector database is unavailable.");
    console.error("   Ensure Qdrant is running on port 6333 (docker compose up -d).");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Backend running at http://localhost:${PORT}`);
    console.log(`   SSE stream:    GET  http://localhost:${PORT}/api/form-events?sessionId=<id>`);
    console.log(`   Vapi webhook:  POST http://localhost:${PORT}/webhook/vapi`);
    console.log(`   Knowledge base: POST http://localhost:${PORT}/api/ask-knowledge`);
    console.log(`   User memory:   GET  http://localhost:${PORT}/api/user-memory/<userId>`);
  });
}

start();
