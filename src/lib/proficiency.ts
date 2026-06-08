import { UNLOCK_THRESHOLD } from "@/lib/constants";
import { INFORMAL_CONTRACTIONS } from "@/lib/linguistic-rules";
import type { ChatAnalytics, RuleProgressEntry } from "@/types";

/** Non-linear curve for sub-scores. */
function curve(value: number): number {
  const clamped = Math.max(0, Math.min(1, value));
  return 1 - Math.exp(-3.5 * clamped);
}

/** Global chat proficiency (0–100): primarily driven by main AI chat performance. */
export function calculateGlobalChatProficiency(
  analytics: ChatAnalytics,
  grammarProgress: RuleProgressEntry[],
  structureProgress: RuleProgressEntry[],
): number {
  if (analytics.totalUserMessages === 0) {
    const masteredRules =
      grammarProgress.filter((entry) => entry.practiceComplete).length +
      structureProgress.filter((entry) => entry.practiceComplete).length;
    return Math.min(15, masteredRules * 3);
  }

  const mistakeRate =
    analytics.totalChatMistakes / Math.max(1, analytics.totalUserMessages);
  const accuracyScore = Math.max(0, 1 - mistakeRate * 1.8);

  const contractionScore = Math.min(
    1,
    analytics.contractionUsageCount / Math.max(3, analytics.totalUserMessages * 0.3),
  );

  const speakingScore =
    analytics.speakingSessionCount > 0
      ? analytics.speakingAccuracyTotal / analytics.speakingSessionCount
      : 0.4;

  const rulesUsedScore = Math.min(
    1,
    analytics.unlockedRulesUsedInChat / 4,
  );

  const masteredCount =
    grammarProgress.filter((entry) => entry.practiceComplete).length +
    structureProgress.filter((entry) => entry.practiceComplete).length;
  const ruleChainBonus = Math.min(0.2, masteredCount * 0.025);

  const chatPractice =
    accuracyScore * 0.45 +
    speakingScore * 0.3 +
    contractionScore * 0.15 +
    rulesUsedScore * 0.1;

  const weighted = chatPractice * 0.85 + ruleChainBonus;
  return Math.min(100, Math.round(curve(weighted) * 100));
}

export function detectContractions(text: string): string[] {
  const lower = text.toLowerCase();
  return INFORMAL_CONTRACTIONS.filter((word) => {
    const pattern = new RegExp(`\\b${word}\\b`, "i");
    return pattern.test(lower);
  });
}

export function isDialectUnlocked(proficiency: number): boolean {
  return proficiency >= UNLOCK_THRESHOLD;
}

export function isLevelUnlocked(
  proficiency: number,
  isFoundational: boolean,
): boolean {
  if (isFoundational) {
    return true;
  }
  return proficiency >= UNLOCK_THRESHOLD;
}

export function isRuleChainUnlocked(
  progress: RuleProgressEntry[],
  ruleIndex: number,
): boolean {
  if (ruleIndex === 0) {
    return true;
  }
  const previous = progress[ruleIndex - 1];
  return Boolean(previous?.theoryComplete && previous?.practiceComplete);
}

export function isRuleMastered(
  progress: RuleProgressEntry[],
  ruleId: string,
): boolean {
  const entry = progress.find((item) => item.ruleId === ruleId);
  return Boolean(entry?.theoryComplete && entry?.practiceComplete);
}

export function getMasteredRuleCount(progress: RuleProgressEntry[]): number {
  return progress.filter(
    (entry) => entry.theoryComplete && entry.practiceComplete,
  ).length;
}
