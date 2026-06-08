"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { BackToChatButton } from "@/components/learning/BackToChatButton";
import type { MistakeRecord } from "@/types";

interface LearningPageShellProps {
  title: string;
  subtitle: string;
  methodology: string;
  icon: ReactNode;
  personalizedMistakes: MistakeRecord[];
  children: ReactNode;
}

export function LearningPageShell({
  title,
  subtitle,
  methodology,
  icon,
  personalizedMistakes,
  children,
}: LearningPageShellProps) {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-white/10 bg-slate-900/60 px-4 py-4 backdrop-blur-sm md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <BackToChatButton />
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-300">
              {icon}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white md:text-2xl">{title}</h1>
              <p className="text-sm text-slate-400">{subtitle}</p>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-3 max-w-7xl text-xs text-indigo-300/80">
          Methodology: {methodology}
        </p>
      </header>

      {personalizedMistakes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-error-amber/20 bg-error-amber/5 px-4 py-3 md:px-8"
        >
          <p className="mx-auto max-w-7xl text-sm text-error-amber">
            Personalized from your chat session — {personalizedMistakes.length}{" "}
            recent mistake{personalizedMistakes.length !== 1 ? "s" : ""} inform
            today&apos;s exercises.
          </p>
        </motion.div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
