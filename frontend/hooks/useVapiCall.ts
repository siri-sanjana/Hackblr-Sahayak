"use client";

import { useCallback, useRef } from "react";
import { useFormStore } from "@/lib/formStore";
import { getVapiClient } from "@/lib/vapiClient";
import { getLanguageConfig } from "@/lib/localizations";

export function useVapiCall() {
  const { sessionId, setCallActive, callActive, setError, selectedLanguage } = useFormStore();
  const vapiRef = useRef<any>(null);

  const startCall = useCallback(async () => {
    // Lazy initialize Vapi client on first click
    if (!vapiRef.current && typeof window !== "undefined") {
      vapiRef.current = getVapiClient();
    }
    
    const vapi = vapiRef.current;
    if (!vapi || callActive) return;

    // Remove any existing listeners to prevent duplicates from overlapping sessions
    vapi.removeAllListeners();

    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "";
    if (!assistantId || assistantId === "your_vapi_assistant_id_here") {
      setError("Assistant ID is not configured.");
      return;
    }

    // Prepare localized greeting and transcriber language
    const langConfig = getLanguageConfig(selectedLanguage);

    // Set UI state immediately (within click handler — satisfies browser gesture requirements)
    setError(null);
    setCallActive(true);

    try {
      const langConfig = getLanguageConfig(selectedLanguage);

      // Start Vapi with full Assistant Overrides
      // We explicitly provide the provider/model to ensure the override is valid
      await vapi.start(assistantId, { 
        metadata: { sessionId },
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: langConfig.code === "en-IN" ? "en-IN" : langConfig.code
        },
        firstMessage: langConfig.firstMessage
      });

      let currentMsgId = "";
      let lastRole: string | null = null;

      vapi.on("message", (msg: { type: string; role?: string; transcript?: string; transcriptType?: "partial" | "final" }) => {
        if (msg.type === "transcript" && msg.role && msg.transcript) {
          // New bubble if the speaker changed or no active bubble
          const isContinuation = msg.role === lastRole && currentMsgId !== "";
          if (!isContinuation) {
            currentMsgId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            lastRole = msg.role;
          }

          useFormStore.getState().updateLatestTranscript({
            id: currentMsgId,
            role: msg.role as "assistant" | "user",
            text: msg.transcript.trim(),
            timestamp: Date.now(),
          });

          // Reset bubble when speaker finishes so next utterance gets a fresh one
          if (msg.transcriptType === "final") {
            currentMsgId = "";
          }
        }
      });

      vapi.on("call-end", () => {
        setCallActive(false);
        vapi.removeAllListeners();
      });

      vapi.on("error", (err: unknown) => {
        console.error("Vapi error:", err);
        setError("Voice session error. Please check your API keys and try again.");
        setCallActive(false);
      });
    } catch (err) {
      console.error("Failed to start Vapi call:", err);
      setError("Failed to start voice session. Ensure your Vapi public key is correct.");
      setCallActive(false);
    }
  }, [callActive, sessionId, setCallActive, setError]);

  const stopCall = useCallback(() => {
    vapiRef.current?.stop();
    setCallActive(false);
  }, [setCallActive]);

  return { startCall, stopCall, callActive };
}
