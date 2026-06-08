"use client";

import { BookOpen, Layers } from "lucide-react";
import type { ReactNode } from "react";
import { LearningPageShell } from "@/components/learning/LearningPageShell";
import { RuleChainColumn } from "@/components/learning/RuleChainColumn";
import { RuleMasteryPanel } from "@/components/learning/RuleMasteryPanel";
import { useLearning } from "@/context/LearningContext";
import { useCategoryMistakes } from "@/hooks/useCategoryMistakes";
import { getRuleById, getRuleChain } from "@/lib/linguistic-rules";
import { getActiveRuleIndex } from "@/lib/rule-progress";
import type { RuleChainType } from "@/types";

interface RuleChainPageProps {
  chainType: RuleChainType;
}

const PAGE_CONFIG: Record<
  RuleChainType,
  { title: string; subtitle: string; methodology: string; icon: ReactNode; category: "grammar" | "structure" }
> = {
  grammar: {
    title: "Grammar — Deep Linguistic Chain",
    subtitle: "Structural logic from the bones up — no abstract textbook rules",
    methodology: "V3 Principle · To Be Time Marker · Core Sentence Rule",
    icon: <BookOpen className="h-5 w-5" />,
    category: "grammar",
  },
  structure: {
    title: "Structure & Phonetics Chain",
    subtitle: "Lexical chunks, contractions, and rhythm at the structural level",
    methodology: "Lexical Approach · Chunk Transfer · Shadowing Rhythm",
    icon: <Layers className="h-5 w-5" />,
    category: "structure",
  },
};

export function RuleChainPage({ chainType }: RuleChainPageProps) {
  const {
    region,
    grammarRuleProgress,
    structureRuleProgress,
    activeRuleId,
    setActiveRule,
    markTheoryComplete,
    markPracticeComplete,
    isRuleUnlockedInChain,
  } = useLearning();

  const config = PAGE_CONFIG[chainType];
  const mistakes = useCategoryMistakes(config.category);
  const rules = getRuleChain(chainType, region ?? "US");
  const progress =
    chainType === "grammar" ? grammarRuleProgress : structureRuleProgress;

  const defaultRuleIndex = getActiveRuleIndex(progress, chainType, region ?? "US");
  const selectedRuleId =
    activeRuleId && rules.some((rule) => rule.id === activeRuleId)
      ? activeRuleId
      : rules[defaultRuleIndex]?.id ?? rules[0]?.id;

  const selectedRule = getRuleById(selectedRuleId ?? "");
  const selectedIndex = rules.findIndex((rule) => rule.id === selectedRuleId);
  const entry = progress.find((item) => item.ruleId === selectedRuleId);

  return (
    <LearningPageShell
      title={config.title}
      subtitle={config.subtitle}
      methodology={config.methodology}
      icon={config.icon}
      personalizedMistakes={mistakes}
    >
      <div className="mb-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3 text-sm text-indigo-200">
        <strong>Main Chat = Global Arena.</strong> The 0–90% proficiency bar
        tracks your real-time chat performance (mistakes, contractions like
        wanna/gonna/kinda, speaking accuracy). Master each rule here first —
        then prove it in the tutor chat to unlock dialects at 90%.
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(260px,320px)_1fr]">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Sequential Rule Chain
          </h2>
          <RuleChainColumn
            rules={rules}
            progress={progress}
            activeRuleId={selectedRuleId ?? null}
            onSelectRule={(ruleId, unlocked) => {
              if (unlocked) {
                setActiveRule(ruleId);
              }
            }}
            isRuleUnlocked={(index) => isRuleUnlockedInChain(chainType, index)}
          />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Mastery Loop — Rule #{selectedRule?.order ?? 1}
          </h2>
          {selectedRule && selectedIndex >= 0 ? (
            <RuleMasteryPanel
              key={selectedRule.id}
              rule={selectedRule}
              theoryComplete={Boolean(entry?.theoryComplete)}
              practiceComplete={Boolean(entry?.practiceComplete)}
              onCompleteTheory={() => markTheoryComplete(chainType, selectedRule.id)}
              onCompletePractice={() =>
                markPracticeComplete(chainType, selectedRule.id)
              }
            />
          ) : (
            <p className="text-slate-500">Select an unlocked rule from the chain.</p>
          )}
        </section>
      </div>
    </LearningPageShell>
  );
}
