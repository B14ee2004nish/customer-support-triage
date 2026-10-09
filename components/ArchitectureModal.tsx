'use client';

import React from 'react';
import GlassCard from './GlassCard';
import { X, Cpu, Database, Sparkles, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ArchitectureModal({ isOpen, onClose }: ArchitectureModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <GlassCard gradientBorder className="p-6 sm:p-8 bg-slate-900/95 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">System Architecture & Pipeline</h3>
                <p className="text-xs text-slate-400">Next.js 14 App Router • Supabase PostgreSQL • Gemini 1.5 Flash</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ASCII Diagram */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Triage Pipeline Flowchart
            </h4>
            <pre className="font-mono text-[11px] sm:text-xs text-cyan-300 bg-slate-950/80 p-4 rounded-xl border border-white/10 overflow-x-auto leading-relaxed">
{`+-----------------------+
|  Incoming Ticket      |  (Web portal, Email webhook, API)
+-----------+-----------+
            |
            v
+-----------------------+
|  Gemini 1.5 Flash     |  (Strict JSON generation with temperature: 0.1)
|  AI Triage Engine     |  Schema: {category, priority, confidence, reasoning}
+-----------+-----------+
            |
            +------------------------------------+
            |                                    |
            v                                    v
 [Confidence >= 0.75 &               [Confidence < 0.75 OR
  Priority != Critical]               Priority == Critical]
            |                                    |
            v                                    v
+-----------------------+            +-----------------------+
| Autonomous Routing    |            | Flag Human Review     |
| Direct to Dept Queue  |            | Triage Queue Action   |
+-----------+-----------+            +-----------+-----------+
            |                                    |
            |                                    v
            |                        +-----------------------+
            |                        | Specialist Override   |
            |                        | or Quick Sign-Off     |
            |                        +-----------+-----------+
            |                                    |
            +-----------------+------------------+
                              |
                              v
                +---------------------------+
                |  Supabase PostgreSQL      |
                |  - tickets (Row Level Sec)|
                |  - ticket_events (Audit)  |
                +---------------------------+`}
            </pre>
          </div>

          {/* Pipeline Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 font-bold text-indigo-300">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Zero-Shot Precision Prompting</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Gemini 1.5 Flash evaluates both sentiment and semantics across 6 business categories. Strict Zod parsing guarantees structural schema safety.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 font-bold text-purple-300">
                <ShieldCheck className="w-4 h-4 text-pink-400" />
                <span>Deterministic Review Guardrails</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Any classification with confidence &lt; 0.75 or priority labeled as Critical triggers mandatory human verification to prevent catastrophic misroutings.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 font-bold text-cyan-300">
                <Database className="w-4 h-4 text-indigo-400" />
                <span>Supabase PostgreSQL Storage</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Persistent relational data storage with indexed ticket lookups, automatic updated_at triggers, and immutable ticket_events audit logs.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Audit & Compliance Trail</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Every classification, human override, status change, and assignment is timestamped and recorded with before-and-after payload diffs.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 transition-all"
            >
              Close Overview
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
