"use client";

import { useFormStore } from "@/lib/formStore";
import { FORM_SECTIONS } from "@/lib/types";
import type { FormFieldKey } from "@/lib/types";
import { FileText, ChevronRight, Hash, Ban } from "lucide-react";

export default function LiveForm() {
  const { form, skippedFields } = useFormStore();

  const totalFields = FORM_SECTIONS.flatMap((s) => s.fields).length;
  const filledFields = Object.keys(form).filter(
    (k) => form[k as FormFieldKey] !== undefined && form[k as FormFieldKey] !== "" && form[k as FormFieldKey] !== "__skipped__"
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {FORM_SECTIONS.map((section) => {
        // Business logic for conditional sections
        if (section.conditional) {
          const { dependsOn } = section.conditional;
          const currentVal = form[dependsOn];
          const isSkipped = skippedFields.has(dependsOn) || currentVal === false;
          if (isSkipped) return null;
        }

        return (
          <div key={section.title} className="space-y-3">
            <div className="flex items-center gap-2 border-l-2 border-blue-600 pl-3">
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Registry Section: {section.title}
              </h3>
            </div>

            <div className="border border-slate-800 rounded bg-slate-900/40 divide-y divide-slate-800/60 transition-all duration-500">
              {section.fields.map((field) => {
                const rawValue = form[field.key];
                const isSkipped = skippedFields.has(field.key) || rawValue === "__skipped__";
                const isFilled = rawValue !== undefined && rawValue !== "" && !isSkipped;
                
                let displayValue = "";
                if (isFilled) {
                  if (field.key === "hasBusiness") displayValue = "REGISTERED";
                  else if (field.key === "annualIncome" || field.key === "businessIncome") 
                    displayValue = `INR ${Number(rawValue).toLocaleString("en-IN")}`;
                  else displayValue = String(rawValue).toUpperCase();
                }

                return (
                  <div
                    key={field.key}
                    className={`
                      flex items-center gap-4 px-5 py-3 transition-colors duration-300
                      ${isFilled ? "bg-blue-600/[0.03]" : ""}
                    `}
                  >
                    {/* Status Ledger Icon */}
                    <div className="shrink-0 flex items-center justify-center w-8">
                      {isFilled ? (
                        <Hash className="w-3.5 h-3.5 text-blue-500" strokeWidth={3} />
                      ) : isSkipped ? (
                        <Ban className="w-3.5 h-3.5 text-slate-700" />
                      ) : (
                        <div className="w-1 h-1 rounded-full bg-slate-800" />
                      )}
                    </div>

                    {/* Field Identification */}
                    <div className="w-48 shrink-0">
                      <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                        {field.label}
                      </span>
                    </div>

                    {/* Registry Content */}
                    <div className="flex-1 min-w-0">
                      {isFilled ? (
                        <div key={`${field.key}-${rawValue}`}>
                          <p className="text-xs font-mono font-bold text-white tracking-widest animate-slide-in">
                            {displayValue}
                          </p>
                        </div>
                      ) : isSkipped ? (
                        <span className="text-[10px] text-slate-700 font-bold uppercase tracking-tighter">N/A [Bypassed]</span>
                      ) : (
                        <span className="text-[10px] text-slate-800 font-bold uppercase tracking-tighter">Pending Data Capture...</span>
                      )}
                    </div>

                    {/* Verification Mark */}
                    {isFilled && (
                      <div className="shrink-0 flex items-center gap-1 opacity-50">
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Verified</span>
                        <ChevronRight className="w-3 h-3 text-blue-500" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
