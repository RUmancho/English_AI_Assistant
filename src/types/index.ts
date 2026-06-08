export type Region = "US" | "GB";

export type CategoryScreen =
  | "grammar"
  | "pronunciation"
  | "vocabulary"
  | "structure";

export type AppScreen = "flag" | "roadmap" | "dashboard" | CategoryScreen;

export type CommunicationMode = "text" | "audio";

export type RuleChainType = "grammar" | "structure";

export type LevelId =
  | "general-american"
  | "southern-american"
  | "new-york"
  | "received-pronunciation"
  | "cockney"
  | "scottish";

export type ErrorCategory =
  | "grammar"
  | "pronunciation"
  | "vocabulary"
  | "structure";

export type DissectionRole =
  | "subject"
  | "timeMarker"
  | "aspectTransfer"
  | "tenseTransfer"
  | "v3Participle"
  | "stateDescriptor"
  | "chunk"
  | "object"
  | "auxiliary";

export interface SentenceSegment {
  text: string;
  role: DissectionRole;
  label: string;
  logic: string;
}

export interface RuleProgressEntry {
  ruleId: string;
  theoryComplete: boolean;
  practiceComplete: boolean;
}

export interface ChatAnalytics {
  totalUserMessages: number;
  totalChatMistakes: number;
  contractionUsageCount: number;
  speakingSessionCount: number;
  speakingAccuracyTotal: number;
  unlockedRulesUsedInChat: number;
}

export interface LevelDefinition {
  id: LevelId;
  region: Region;
  name: string;
  description: string;
  isFoundational: boolean;
  unlockThreshold: number;
}

export interface MistakeRecord {
  id: string;
  category: ErrorCategory;
  userSaid: string;
  correctForm: string;
  timestamp: number;
  levelId: LevelId;
}

export interface VocabularyItem {
  word: string;
  definition: string;
  failures: number;
  lastSeen: number;
  nextReview: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  mode: CommunicationMode;
  timestamp: number;
}

export interface CategoryStats {
  category: ErrorCategory;
  count: number;
  recentMistakes: MistakeRecord[];
}

export interface TutorMetadata {
  errors: Array<{
    category: ErrorCategory;
    userSaid: string;
    correctForm: string;
  }>;
  vocabularyUpdates: Array<{
    word: string;
    definition: string;
    failed: boolean;
  }>;
  practiceScoreDelta: number;
  theoryScoreDelta: number;
  shadowPhrase?: string;
  contractionsDetected?: string[];
  rulesApplied?: string[];
  speakingAccuracy?: number;
  formalityMet?: boolean;
  formalityWarning?: string;
  detectedFormalityLevel?: number;
}

export interface LearningState {
  region: Region | null;
  activeLevelId: LevelId | null;
  screen: AppScreen;
  proficiency: number;
  theoryProgress: number;
  practiceProgress: number;
  messages: ChatMessage[];
  mistakes: MistakeRecord[];
  vocabulary: VocabularyItem[];
  communicationMode: CommunicationMode;
  grammarRuleProgress: RuleProgressEntry[];
  structureRuleProgress: RuleProgressEntry[];
  chatAnalytics: ChatAnalytics;
  activeRuleId: string | null;
  formalityLevel: number;
}
