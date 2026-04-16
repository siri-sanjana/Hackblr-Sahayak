"use client";

import { useSSEFormUpdates } from "@/hooks/useSSEFormUpdates";
import VoiceButton from "@/components/VoiceButton";
import LiveForm from "@/components/LiveForm";
import TranscriptPanel from "@/components/TranscriptPanel";
import ReturningUserBanner from "@/components/ReturningUserBanner";
import { useFormStore } from "@/lib/formStore";
import { ShieldCheck, Activity, AlertCircle } from "lucide-react";

export default function HomePage() {
  useSSEFormUpdates();
  const { callActive, error, form } = useFormStore();

  const fieldsCollected = Object.keys(form).filter(
    (k) => form[k as keyof typeof form] !== undefined && form[k as keyof typeof form] !== "__skipped__"
  ).length;

  return (
    <main className="min-h-screen flex flex-col bg-slate-950 font-sans antialiased text-slate-200">
      {/* ── Top Navigation Bar ── */}
      <nav className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-white uppercase">Sahayak Portal</span>
            <div className="flex items-center gap-2 -mt-1">
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Govt. Verification Engine</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className={`status-pill ${callActive ? "status-pill-active" : "status-pill-ready"}`}>
              {callActive ? (
                <span className="flex items-center gap-1.5 animate-pulse">
                  <Activity className="w-3 h-3" /> System Active
                </span>
              ) : (
                "System Idle"
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-[1600px] mx-auto w-full p-6 grid grid-cols-12 gap-6">
        {/* ── Sidebar / Control Cluster ── */}
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6 sticky top-24 lg:h-[calc(100vh-theme(spacing.32))] overflow-hidden">
          {/* Interaction Header */}
          <section className="dashboard-card p-8 flex flex-col items-center justify-center text-center gap-6 bg-gradient-to-b from-slate-800/50 to-slate-900/50">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-white">Voice Liaison Office</h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[280px]">
                Authorized voice-to-field processing agent. Initiate communication below to begin registry population.
              </p>
            </div>

            <VoiceButton />

            {/* Error Message Cluster */}
            {error && (
              <div className="animate-slide-in flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded text-left">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-red-500 uppercase">Configuration Error</p>
                  <p className="text-[11px] text-red-200/80 leading-normal">{error}</p>
                </div>
              </div>
            )}
            
            <div className="w-full h-px bg-slate-800/50" />
            
            <div className="grid grid-cols-2 w-full gap-4">
              <div className="p-3 bg-slate-950/30 rounded border border-slate-800/50">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Session ID</p>
                <p className="text-xs font-mono text-slate-300">#v2-refactor</p>
              </div>
              <div className="p-3 bg-slate-950/30 rounded border border-slate-800/50">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Mode</p>
                <p className="text-xs font-mono text-slate-300">Enterprise</p>
              </div>
            </div>
          </section>

          {/* Transcript Log */}
          <section className="dashboard-card flex-1 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-800/30 flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Communication Log</h3>
              <span className="text-[10px] text-slate-500">Real-time Encrypted</span>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <TranscriptPanel />
            </div>
          </section>
        </aside>

        {/* ── Main Dashboard Content ── */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <ReturningUserBanner />
          
          <section className="dashboard-card flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/30 flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-white uppercase tracking-tight">Active Registry Monitor</h2>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Live Population: {fieldsCollected} fields verified
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-[10px] font-bold text-slate-500 bg-slate-700/50 px-3 py-1 rounded hover:bg-slate-700 transition-colors uppercase">
                  Reset Form
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-950/10">
              <LiveForm />
            </div>
          </section>
        </div>
      </div>

      <footer className="h-12 border-t border-slate-800 flex items-center justify-between px-6 text-[10px] text-slate-600 bg-slate-900/40">
        <div>© 2026 Sahayak Govt Portal · Institutional Grade Interface</div>
        <div className="flex gap-4 uppercase font-bold tracking-tighter">
          <span>Vector DB: Qdrant</span>
          <span className="text-slate-800">|</span>
          <span>Voice Logic: Vapi</span>
          <span className="text-slate-800">|</span>
          <span>Security: AES-256</span>
        </div>
      </footer>
    </main>
  );
}
