import type { AgriSubsidyForm, FormFieldKey } from "./types";
import { create } from "zustand";

interface FormStore {
  form: Partial<AgriSubsidyForm>;
  skippedFields: Set<FormFieldKey>;
  callActive: boolean;
  sessionId: string;
  transcript: TranscriptLine[];
  returningUser: ReturnUserInfo | null;
  error: string | null;
  selectedLanguage: string;

  // Actions
  updateField: (field: FormFieldKey, value: string | number | boolean) => void;
  skipFields: (fields: FormFieldKey[]) => void;
  setCallActive: (active: boolean) => void;
  setSessionId: (id: string) => void;
  appendTranscript: (line: TranscriptLine) => void;
  updateLatestTranscript: (line: TranscriptLine) => void;
  setReturningUser: (info: ReturnUserInfo | null) => void;
  setError: (error: string | null) => void;
  setLanguage: (lang: string) => void;
  resetForm: () => void;
}

export interface TranscriptLine {
  id: string;
  role: "assistant" | "user";
  text: string;
  timestamp: number;
}

export interface ReturnUserInfo {
  userId: string;
  form: Partial<AgriSubsidyForm>;
  updatedAt: string;
}

const BUSINESS_FIELDS: FormFieldKey[] = ["businessName", "businessType", "businessIncome"];

export const useFormStore = create<FormStore>((set) => ({
  form: {},
  skippedFields: new Set(),
  callActive: false,
  sessionId: generateSessionId(),
  transcript: [],
  returningUser: null,
  error: null,
  selectedLanguage: "en-IN",

  updateField: (field, value) =>
    set((state) => {
      const updatedForm = { ...state.form, [field]: value };
      const updatedSkipped = new Set(state.skippedFields);

      // Non-linear: skip business fields when hasBusiness = false
      if (field === "hasBusiness" && value === false) {
        BUSINESS_FIELDS.forEach((f) => updatedSkipped.add(f));
      }
      if (field === "hasBusiness" && value === true) {
        BUSINESS_FIELDS.forEach((f) => updatedSkipped.delete(f));
      }

      return { form: updatedForm, skippedFields: updatedSkipped };
    }),

  skipFields: (fields) =>
    set((state) => {
      const updatedSkipped = new Set(state.skippedFields);
      fields.forEach((f) => updatedSkipped.add(f));
      return { skippedFields: updatedSkipped };
    }),

  setCallActive: (active) => set({ callActive: active }),
  setSessionId: (id) => set({ sessionId: id }),

  appendTranscript: (line) =>
    set((state) => ({
      transcript: [...state.transcript.slice(-99), line],
    })),

  updateLatestTranscript: (line) =>
    set((state) => {
      const last = state.transcript[state.transcript.length - 1];
      if (last && last.id === line.id) {
        const updated = [...state.transcript];
        updated[updated.length - 1] = line;
        return { transcript: updated };
      }
      return { transcript: [...state.transcript.slice(-99), line] };
    }),

  setReturningUser: (info) => set({ returningUser: info }),
  setError: (error) => set({ error }),
  setLanguage: (lang) => set({ selectedLanguage: lang }),

  resetForm: () =>
    set({
      form: {},
      skippedFields: new Set(),
      transcript: [],
      returningUser: null,
      error: null,
      sessionId: generateSessionId(),
    }),
}));

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
