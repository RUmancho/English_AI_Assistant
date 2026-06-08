"use client";

import { motion } from "framer-motion";
import { Check, Lock, PlayCircle } from "lucide-react";
import type { DeepLinguisticRule } from "@/lib/linguistic-rules";
import type { RuleProgressEntry } from "@/types";

interface RuleChainColumnProps {
  rules: DeepLinguisticRule[];
  progress: RuleProgressEntry[];
  activeRuleId: string | null;
  onSelectRule: (ruleId: string, isUnlocked: boolean) => void;
  isRuleUnlocked: (index: number) => boolean;
}

export function RuleChainColumn({
  rules,
  progress,
  activeRuleId,
  onSelectRule,
  isRuleUnlocked,
}: RuleChainColumnProps) {
  return (
    <div className="relative">
      <div className="absolute bottom-4 left-[1.125rem] top-4 w-0.5 bg-gradient-to-b from-indigo-500 via-indigo-400/40 to-slate-700" />

      <div className="space-y-3">
        {rules.map((rule, index) => {
          const entry = progress.find((item) => item.ruleId === rule.id);
          const unlocked = isRuleUnlocked(index);
          const mastered = Boolean(
            entry?.theoryComplete && entry?.practiceComplete,
          );
          const isActive = activeRuleId === rule.id;
          const theoryDone = Boolean(entry?.theoryComplete);
          const practiceDone = Boolean(entry?.practiceComplete);

          return (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="relative pl-10"
            >
              <div
                className={`absolute left-2.5 top-5 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                  mastered
                    ? "border-emerald-400 bg-emerald-500"
                    : unlocked
                      ? isActive
                        ? "border-indigo-400 bg-indigo-500"
                        : "border-indigo-400/60 bg-indigo-500/40"
                      : "border-slate-600 bg-slate-800"
                }`}
              >
                {mastered ? (
                  <Check className="h-3 w-3 text-white" />
                ) : unlocked ? (
                  <PlayCircle className="h-3 w-3 text-white" />
                ) : (
                  <Lock className="h-2.5 w-2.5 text-slate-500" />
                )}
              </div>

              <button
                type="button"
                disabled={!unlocked}
                onClick={() => onSelectRule(rule.id, unlocked)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  !unlocked
                    ? "cursor-not-allowed border-slate-800 bg-slate-900/40 opacity-50"
                    : isActive
                      ? "border-indigo-400/60 bg-indigo-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                      Rule #{rule.order}
                    </p>
                    <h3 className="mt-0.5 font-semibold text-white">{rule.title}</h3>
                  </div>
                  {!unlocked && (
                    <span className="shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-500">
                      Locked
                    </span>
                  )}
                </div>

                {unlocked && (
                  <div className="mt-3 flex gap-2">
                    <StepBadge label="Theory" done={theoryDone} />
                    <StepBadge label="Practice" done={practiceDone} />
                  </div>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function StepBadge({ label, done }: { label: string; done: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
        done
          ? "bg-emerald-500/20 text-emerald-400"
          : "bg-error-amber/15 text-error-amber"
      }`}
    >
      {done ? `✓ ${label}` : label}
    </span>
  );
}
