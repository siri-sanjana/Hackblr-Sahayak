"use client";

import { useFormStore } from "@/lib/formStore";
import { SUPPORTED_LANGUAGES } from "@/lib/localizations";
import { Languages } from "lucide-react";

export default function LanguageSelector() {
  const { selectedLanguage, setLanguage, callActive } = useFormStore();

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Languages className="w-3 h-3 text-slate-500" />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Interface Language
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => !callActive && setLanguage(lang.code)}
            disabled={callActive}
            className={`
              flex flex-col items-center justify-center p-2 rounded border transition-all duration-200
              ${selectedLanguage === lang.code 
                ? "bg-blue-600/20 border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]" 
                : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400"
              }
              ${callActive ? "opacity-40 cursor-not-allowed" : "cursor-pointer active:scale-95"}
            `}
          >
            <span className="text-[11px] font-bold leading-tight">{lang.nativeName}</span>
            <span className="text-[8px] opacity-60 uppercase font-medium">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
