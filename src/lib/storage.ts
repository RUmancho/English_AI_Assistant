import { FORMALITY_DEFAULT } from "@/lib/formality";
import { initializeRuleProgress } from "@/lib/rule-progress";
import type { ChatAnalytics, LearningState } from "@/types";

const STORAGE_KEY = "ai-language-learning-state";

export const DEFAULT_CHAT_ANALYTICS: ChatAnalytics = {
  totalUserMessages: 0,
  totalChatMistakes: 0,
  contractionUsageCount: 0,
  speakingSessionCount: 0,
  speakingAccuracyTotal: 0,
  unlockedRulesUsedInChat: 0,
};

export const DEFAULT_STATE: LearningState = {
  region: null,
  activeLevelId: null,
  screen: "flag",
  proficiency: 0,
  theoryProgress: 0,
  practiceProgress: 0,
  messages: [],
  mistakes: [],
  vocabulary: [],
  communicationMode: "text",
  grammarRuleProgress: [],
  structureRuleProgress: [],
  chatAnalytics: DEFAULT_CHAT_ANALYTICS,
  activeRuleId: null,
  formalityLevel: FORMALITY_DEFAULT,
};

function migrateState(parsed: Partial<LearningState>): LearningState {
  const region = parsed.region ?? null;
  return {
    ...DEFAULT_STATE,
    ...parsed,
    grammarRuleProgress:
      parsed.grammarRuleProgress?.length
        ? parsed.grammarRuleProgress
        : region
          ? initializeRuleProgress("grammar", region)
          : [],
    structureRuleProgress:
      parsed.structureRuleProgress?.length
        ? parsed.structureRuleProgress
        : region
          ? initializeRuleProgress("structure", region)
          : [],
    chatAnalytics: {
      ...DEFAULT_CHAT_ANALYTICS,
      ...parsed.chatAnalytics,
    },
    activeRuleId: parsed.activeRuleId ?? null,
    formalityLevel: parsed.formalityLevel ?? FORMALITY_DEFAULT,
  };
}

export function loadState(): LearningState {
  if (typeof window === "undefined") {
    return DEFAULT_STATE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_STATE;
    }
    return migrateState(JSON.parse(raw) as Partial<LearningState>);
  } catch (error) {
    console.error("Failed to load learning state:", error);
    return DEFAULT_STATE;
  }
}

export function saveState(state: LearningState): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save learning state:", error);
  }
}
