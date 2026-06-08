"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LEVELS, UNLOCK_THRESHOLD } from "@/lib/constants";
import {
  calculateGlobalChatProficiency,
  detectContractions,
  isRuleChainUnlocked,
} from "@/lib/proficiency";
import { getRuleChain } from "@/lib/linguistic-rules";
import { getActiveRuleIndex, initializeRuleProgress } from "@/lib/rule-progress";
import { clampFormality } from "@/lib/formality";
import { DEFAULT_CHAT_ANALYTICS, DEFAULT_STATE, loadState, saveState } from "@/lib/storage";
import type {
  AppScreen,
  ChatMessage,
  CommunicationMode,
  ErrorCategory,
  LearningState,
  LevelId,
  MistakeRecord,
  Region,
  RuleChainType,
  TutorMetadata,
} from "@/types";

interface LearningContextValue extends LearningState {
  selectRegion: (region: Region) => void;
  setScreen: (screen: AppScreen) => void;
  selectLevel: (levelId: LevelId) => void;
  setCommunicationMode: (mode: CommunicationMode) => void;
  setFormalityLevel: (level: number) => void;
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => ChatMessage;
  applyTutorMetadata: (
    metadata: TutorMetadata,
    levelId: LevelId,
    userMessage?: string,
    mode?: CommunicationMode,
  ) => void;
  getFoundationalProficiency: () => number;
  isLevelAccessible: (levelId: LevelId) => boolean;
  getLevelsForRegion: (region: Region) => typeof LEVELS;
  getMistakesForCategory: (category: ErrorCategory) => MistakeRecord[];
  openCategoryPractice: (category: ErrorCategory) => void;
  backToDashboard: () => void;
  setActiveRule: (ruleId: string) => void;
  markTheoryComplete: (chainType: RuleChainType, ruleId: string) => void;
  markPracticeComplete: (chainType: RuleChainType, ruleId: string) => void;
  isRuleUnlockedInChain: (chainType: RuleChainType, ruleIndex: number) => boolean;
  getMasteredRuleIds: () => string[];
  resetProgress: () => void;
}

const LearningContext = createContext<LearningContextValue | null>(null);

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function recalcProficiency(state: LearningState): number {
  return calculateGlobalChatProficiency(
    state.chatAnalytics,
    state.grammarRuleProgress,
    state.structureRuleProgress,
  );
}

export function LearningProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LearningState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadState();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional client hydration
    setState(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveState(state);
    }
  }, [state, hydrated]);

  const getFoundationalProficiency = useCallback((): number => {
    return state.proficiency;
  }, [state.proficiency]);

  const isLevelAccessible = useCallback(
    (levelId: LevelId): boolean => {
      const level = LEVELS.find((item) => item.id === levelId);
      if (!level || level.region !== state.region) {
        return false;
      }
      if (level.isFoundational) {
        return true;
      }
      return state.proficiency >= UNLOCK_THRESHOLD;
    },
    [state.region, state.proficiency],
  );

  const selectRegion = useCallback((region: Region) => {
    const foundational = LEVELS.find(
      (level) => level.region === region && level.isFoundational,
    );
    setState((prev) => ({
      ...prev,
      region,
      screen: "roadmap",
      activeLevelId: foundational?.id ?? null,
      messages: [],
      mistakes: [],
      vocabulary: [],
      proficiency: 0,
      theoryProgress: 0,
      practiceProgress: 0,
      grammarRuleProgress: initializeRuleProgress("grammar", region),
      structureRuleProgress: initializeRuleProgress("structure", region),
      chatAnalytics: { ...DEFAULT_CHAT_ANALYTICS },
      activeRuleId: null,
    }));
  }, []);

  const setScreen = useCallback((screen: AppScreen) => {
    setState((prev) => ({ ...prev, screen }));
  }, []);

  const selectLevel = useCallback(
    (levelId: LevelId) => {
      if (!isLevelAccessible(levelId)) {
        return;
      }
      setState((prev) => ({
        ...prev,
        activeLevelId: levelId,
        screen: "dashboard",
        messages: [],
      }));
    },
    [isLevelAccessible],
  );

  const setCommunicationMode = useCallback((mode: CommunicationMode) => {
    setState((prev) => ({ ...prev, communicationMode: mode }));
  }, []);

  const setFormalityLevel = useCallback((level: number) => {
    setState((prev) => ({
      ...prev,
      formalityLevel: clampFormality(level),
    }));
  }, []);

  const addMessage = useCallback(
    (message: Omit<ChatMessage, "id" | "timestamp">): ChatMessage => {
      const fullMessage: ChatMessage = {
        ...message,
        id: createId(),
        timestamp: Date.now(),
      };
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, fullMessage],
      }));
      return fullMessage;
    },
    [],
  );

  const getMasteredRuleIds = useCallback((): string[] => {
    const grammar = state.grammarRuleProgress
      .filter((entry) => entry.theoryComplete && entry.practiceComplete)
      .map((entry) => entry.ruleId);
    const structure = state.structureRuleProgress
      .filter((entry) => entry.theoryComplete && entry.practiceComplete)
      .map((entry) => entry.ruleId);
    return [...grammar, ...structure];
  }, [state.grammarRuleProgress, state.structureRuleProgress]);

  const applyTutorMetadata = useCallback(
    (
      metadata: TutorMetadata,
      levelId: LevelId,
      userMessage?: string,
      mode?: CommunicationMode,
    ) => {
      setState((prev) => {
        const newMistakes: MistakeRecord[] = (metadata.errors ?? []).map(
          (error) => ({
            id: createId(),
            category: error.category as ErrorCategory,
            userSaid: error.userSaid,
            correctForm: error.correctForm,
            timestamp: Date.now(),
            levelId,
          }),
        );

        const vocabularyMap = new Map(
          prev.vocabulary.map((item) => [item.word.toLowerCase(), item]),
        );

        for (const update of metadata.vocabularyUpdates ?? []) {
          const key = update.word.toLowerCase();
          const existing = vocabularyMap.get(key);
          const failures = (existing?.failures ?? 0) + (update.failed ? 1 : 0);
          const intervalDays = Math.min(14, Math.pow(2, failures));
          const nextReview = Date.now() + intervalDays * 24 * 60 * 60 * 1000;

          vocabularyMap.set(key, {
            word: update.word,
            definition: update.definition,
            failures,
            lastSeen: Date.now(),
            nextReview,
          });
        }

        const detectedContractions = userMessage
          ? detectContractions(userMessage)
          : [];
        const aiContractions = metadata.contractionsDetected ?? [];
        const allContractions = new Set([
          ...detectedContractions,
          ...aiContractions,
        ]);

        const chatAnalytics = { ...prev.chatAnalytics };
        if (userMessage) {
          chatAnalytics.totalUserMessages += 1;
          chatAnalytics.totalChatMistakes += newMistakes.length;
          if (prev.formalityLevel <= 6 && metadata.formalityMet !== false) {
            chatAnalytics.contractionUsageCount += allContractions.size;
          }
          if (mode === "audio" && metadata.speakingAccuracy !== undefined) {
            chatAnalytics.speakingSessionCount += 1;
            chatAnalytics.speakingAccuracyTotal += metadata.speakingAccuracy;
          }
          if (metadata.rulesApplied?.length) {
            chatAnalytics.unlockedRulesUsedInChat += metadata.rulesApplied.length;
          }
        }

        const masteredCount =
          prev.grammarRuleProgress.filter(
            (entry) => entry.theoryComplete && entry.practiceComplete,
          ).length +
          prev.structureRuleProgress.filter(
            (entry) => entry.theoryComplete && entry.practiceComplete,
          ).length;

        const theoryProgress = Math.min(1, masteredCount / 8);
        const practiceProgress = Math.min(
          1,
          chatAnalytics.totalUserMessages > 0
            ? 1 -
                chatAnalytics.totalChatMistakes /
                  Math.max(1, chatAnalytics.totalUserMessages * 2)
            : 0,
        );

        const nextState: LearningState = {
          ...prev,
          mistakes: [...newMistakes, ...prev.mistakes].slice(0, 100),
          vocabulary: Array.from(vocabularyMap.values()),
          chatAnalytics,
          theoryProgress,
          practiceProgress,
        };

        return {
          ...nextState,
          proficiency: recalcProficiency(nextState),
        };
      });
    },
    [],
  );

  const updateRuleProgress = useCallback(
    (
      chainType: RuleChainType,
      ruleId: string,
      patch: Partial<{ theoryComplete: boolean; practiceComplete: boolean }>,
    ) => {
      setState((prev) => {
        const key =
          chainType === "grammar"
            ? "grammarRuleProgress"
            : "structureRuleProgress";
        const updated = prev[key].map((entry) =>
          entry.ruleId === ruleId ? { ...entry, ...patch } : entry,
        );
        const nextState = { ...prev, [key]: updated };
        return {
          ...nextState,
          proficiency: recalcProficiency(nextState),
        };
      });
    },
    [],
  );

  const markTheoryComplete = useCallback(
    (chainType: RuleChainType, ruleId: string) => {
      updateRuleProgress(chainType, ruleId, { theoryComplete: true });
    },
    [updateRuleProgress],
  );

  const markPracticeComplete = useCallback(
    (chainType: RuleChainType, ruleId: string) => {
      updateRuleProgress(chainType, ruleId, { practiceComplete: true });
    },
    [updateRuleProgress],
  );

  const isRuleUnlockedInChain = useCallback(
    (chainType: RuleChainType, ruleIndex: number): boolean => {
      const progress =
        chainType === "grammar"
          ? state.grammarRuleProgress
          : state.structureRuleProgress;
      return isRuleChainUnlocked(progress, ruleIndex);
    },
    [state.grammarRuleProgress, state.structureRuleProgress],
  );

  const setActiveRule = useCallback((ruleId: string) => {
    setState((prev) => ({ ...prev, activeRuleId: ruleId }));
  }, []);

  const getLevelsForRegion = useCallback((region: Region) => {
    return LEVELS.filter((level) => level.region === region);
  }, []);

  const getMistakesForCategory = useCallback(
    (category: ErrorCategory): MistakeRecord[] => {
      return state.mistakes.filter((mistake) => mistake.category === category);
    },
    [state.mistakes],
  );

  const openCategoryPractice = useCallback((category: ErrorCategory) => {
    setState((prev) => {
      let activeRuleId = prev.activeRuleId;
      if (category === "grammar" || category === "structure") {
        const chainType = category;
        const region = prev.region ?? "US";
        const progress =
          chainType === "grammar"
            ? prev.grammarRuleProgress
            : prev.structureRuleProgress;
        const rules = getRuleChain(chainType, region);
        const activeIndex = getActiveRuleIndex(progress, chainType, region);
        activeRuleId = rules[activeIndex]?.id ?? rules[0]?.id ?? null;
      }
      return { ...prev, screen: category, activeRuleId };
    });
  }, []);

  const backToDashboard = useCallback(() => {
    setState((prev) => ({ ...prev, screen: "dashboard" }));
  }, []);

  const resetProgress = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  const value = useMemo<LearningContextValue>(
    () => ({
      ...state,
      selectRegion,
      setScreen,
      selectLevel,
      setCommunicationMode,
      setFormalityLevel,
      addMessage,
      applyTutorMetadata,
      getFoundationalProficiency,
      isLevelAccessible,
      getLevelsForRegion,
      getMistakesForCategory,
      openCategoryPractice,
      backToDashboard,
      setActiveRule,
      markTheoryComplete,
      markPracticeComplete,
      isRuleUnlockedInChain,
      getMasteredRuleIds,
      resetProgress,
    }),
    [
      state,
      selectRegion,
      setScreen,
      selectLevel,
      setCommunicationMode,
      setFormalityLevel,
      addMessage,
      applyTutorMetadata,
      getFoundationalProficiency,
      isLevelAccessible,
      getLevelsForRegion,
      getMistakesForCategory,
      openCategoryPractice,
      backToDashboard,
      setActiveRule,
      markTheoryComplete,
      markPracticeComplete,
      isRuleUnlockedInChain,
      getMasteredRuleIds,
      resetProgress,
    ],
  );

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Loading your learning journey...
      </div>
    );
  }

  return (
    <LearningContext.Provider value={value}>{children}</LearningContext.Provider>
  );
}

export function useLearning(): LearningContextValue {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error("useLearning must be used within LearningProvider");
  }
  return context;
}
