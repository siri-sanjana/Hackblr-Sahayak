"use client";

import { useEffect, useRef, useCallback } from "react";
import { useFormStore } from "@/lib/formStore";
import type { FormFieldKey } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface SSEEvent {
  type: "form_update" | "status";
  field?: FormFieldKey;
  value?: string | number | boolean;
  message?: string;
  sessionId?: string;
}

export function useSSEFormUpdates() {
  const { sessionId, updateField } = useFormStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `${API_URL}/form-events?sessionId=${sessionId}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      console.log("✅ SSE connected for session:", sessionId);
    };

    es.onmessage = (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data);
        console.log("📥 SSE Received:", data);
        if (data.type === "form_update" && data.field != null && data.value !== undefined) {
          if (data.value === "__skipped__") return; // handled by skippedFields
          updateField(data.field, data.value);
        }
      } catch (err) {
        console.warn("SSE parse error:", err);
      }
    };

    es.onerror = (err) => {
      console.warn("SSE error — will retry:", err);
      setTimeout(connect, 3000);
    };
  }, [sessionId, updateField]);

  useEffect(() => {
    connect();
    return () => {
      eventSourceRef.current?.close();
    };
  }, [connect]);
}
