"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, TrendingDown } from "lucide-react";
import { useMemo, useState } from "react";
import { ERROR_CATEGORY_LABELS } from "@/lib/constants";
import { useLearning } from "@/context/LearningContext";
import type { CategoryStats, ErrorCategory, MistakeRecord } from "@/types";

const ERROR_CATEGORIES: ErrorCategory[] = [
  "grammar",
  "pronunciation",
  "vocabulary",
  "structure",
];

export function ErrorAnalytics() {
  const {
    mistakes,
    proficiency,
    grammarRuleProgress,
    structureRuleProgress,
    chatAnalytics,
    openCategoryPractice,
  } = useLearning();

  const masteredGrammar = grammarRuleProgress.filter(
    (entry) => entry.theoryComplete && entry.practiceComplete,
  ).length;
  const masteredStructure = structureRuleProgress.filter(
    (entry) => entry.theoryComplete && entry.practiceComplete,
  ).length;
  const [expanded, setExpanded] = useState<ErrorCategory | null>(null);

  const categoryStats = useMemo((): CategoryStats[] => {
    const maxPerCategory = Math.max(
      1,
      ...ERROR_CATEGORIES.map(
        (category) =>
          mistakes.filter((mistake) => mistake.category === category).length,
      ),
    );

    return ERROR_CATEGORIES.map((category) => {
      const recentMistakes = mistakes
        .filter((mistake) => mistake.category === category)
        .slice(0, 8);
      return {
        category,
        count: recentMistakes.length,
        recentMistakes,
        fillPercent: (recentMistakes.length / maxPerCategory) * 100,
      };
    });
  }, [mistakes]);

  const totalMistakes = mistakes.length;

  return (
    <aside className="flex h-full flex-col border-l border-white/10 bg-slate-900/80 backdrop-blur-sm">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-error-amber" />
          <h2 className="font-semibold text-white">Error Analytics</h2>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Click a category to practice — yellow highlights keep learning encouraging.
        </p>
      </div>

      <div className="border-b border-white/10 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Global Chat Proficiency
        </p>
        <p className="text-2xl font-bold text-white">{proficiency}%</p>
        <p className="mt-1 text-[10px] text-slate-500">
          Reach 90% in chat to unlock dialects
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400"
            style={{ width: `${proficiency}%` }}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-slate-800/60 p-2">
            <p className="text-slate-500">Rule Chain</p>
            <p className="font-medium text-slate-300">
              {masteredGrammar + masteredStructure}/8
            </p>
          </div>
          <div className="rounded-lg bg-slate-800/60 p-2">
            <p className="text-slate-500">Chat Msgs</p>
            <p className="font-medium text-slate-300">
              {chatAnalytics.totalUserMessages}
            </p>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-slate-800/60 p-2">
            <p className="text-slate-500">Contractions</p>
            <p className="font-medium text-error-amber">
              {chatAnalytics.contractionUsageCount}
            </p>
          </div>
          <div className="rounded-lg bg-slate-800/60 p-2">
            <p className="text-slate-500">Chat Errors</p>
            <p className="font-medium text-slate-300">
              {chatAnalytics.totalChatMistakes}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
          Mistake Categories ({totalMistakes})
        </p>

        <div className="space-y-3">
          {categoryStats.map((stat) => (
            <ErrorCategoryCard
              key={stat.category}
              stat={stat}
              isExpanded={expanded === stat.category}
              onNavigate={() => openCategoryPractice(stat.category)}
              onToggleExpand={() =>
                setExpanded((current) =>
                  current === stat.category ? null : stat.category,
                )
              }
            />
          ))}
        </div>

        {totalMistakes === 0 && (
          <p className="mt-6 text-center text-sm text-slate-500">
            No mistakes yet — start chatting to build your analytics!
          </p>
        )}
      </div>
    </aside>
  );
}

interface ErrorCategoryCardProps {
  stat: CategoryStats & { fillPercent?: number };
  isExpanded: boolean;
  onNavigate: () => void;
  onToggleExpand: () => void;
}

function ErrorCategoryCard({
  stat,
  isExpanded,
  onNavigate,
  onToggleExpand,
}: ErrorCategoryCardProps) {
  const fillPercent =
    "fillPercent" in stat && stat.fillPercent !== undefined
      ? stat.fillPercent
      : stat.count > 0
        ? 100
        : 0;

  return (
    <div className="overflow-hidden rounded-xl border border-white/5 bg-slate-800/40">
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={onNavigate}
          className="group flex flex-1 items-center gap-3 p-3 text-left transition hover:bg-white/5"
        >
          <div className="flex-1">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-medium text-slate-200 group-hover:text-white">
                {ERROR_CATEGORY_LABELS[stat.category]}
                <ChevronRight className="h-3.5 w-3.5 text-indigo-400 opacity-0 transition group-hover:opacity-100" />
              </span>
              <span className="rounded-full bg-error-amber/20 px-2 py-0.5 text-xs font-medium text-error-amber">
                {stat.count}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${fillPercent}%` }}
                className="error-capsule h-full rounded-full"
              />
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={onToggleExpand}
          aria-label="Expand mistake list"
          className="flex items-center border-l border-white/5 px-3 text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
        >
          <ChevronDown
            className={`h-4 w-4 transition ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && stat.recentMistakes.length > 0 && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5"
          >
            {stat.recentMistakes.map((mistake) => (
              <MistakeItem key={mistake.id} mistake={mistake} />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function MistakeItem({ mistake }: { mistake: MistakeRecord }) {
  return (
    <li className="border-b border-white/5 px-3 py-2.5 last:border-0">
      <p className="text-xs text-slate-500">You said</p>
      <p className="text-sm text-error-amber line-through decoration-error-amber/60">
        {mistake.userSaid}
      </p>
      <p className="mt-1 text-xs text-slate-500">Correct</p>
      <p className="text-sm text-emerald-400">{mistake.correctForm}</p>
    </li>
  );
}
