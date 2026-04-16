/**
 * Shared type definitions for the Adaptive Voice-to-Form Engine.
 */

export interface AgriSubsidyForm {
  // Personal
  fullName?: string;
  age?: number;
  gender?: string;
  aadhaarNumber?: string;
  // Location
  village?: string;
  district?: string;
  state?: string;
  // Agricultural
  landSizeAcres?: number;
  cropType?: string;
  irrigationType?: string;
  // Financial
  annualIncome?: number;
  bankAccountNumber?: string;
  hasBusiness?: boolean;
  // Business (dynamically skipped if hasBusiness = false)
  businessName?: string;
  businessType?: string;
  businessIncome?: number;
}

export type FormFieldKey = keyof AgriSubsidyForm;

export interface FormUpdateEvent {
  type: "form_update";
  field: FormFieldKey;
  value: string | number | boolean;
  sessionId: string;
}

export interface SystemStatusEvent {
  type: "status";
  message: string;
  sessionId?: string;
}

export interface UserProfile {
  userId: string;
  form: Partial<AgriSubsidyForm>;
  createdAt: string;
  updatedAt: string;
}

export interface GlossaryEntry {
  term: string;
  simpleExplanation: string;
  example?: string;
}
