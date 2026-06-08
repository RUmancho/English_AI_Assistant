import type { LevelDefinition } from "@/types";

export const UNLOCK_THRESHOLD = 90;

export const OPENROUTER_MODEL = "openai/gpt-4o-mini";

export const ERROR_AMBER = "#FBBF24";

export const LEVELS: LevelDefinition[] = [
  {
    id: "general-american",
    region: "US",
    name: "General American (GA)",
    description: "Core grammar, tenses, and standard US pronunciation foundations.",
    isFoundational: true,
    unlockThreshold: UNLOCK_THRESHOLD,
  },
  {
    id: "southern-american",
    region: "US",
    name: "Southern American",
    description: "Drawl, vowel shifts, and regional Southern expressions.",
    isFoundational: false,
    unlockThreshold: UNLOCK_THRESHOLD,
  },
  {
    id: "new-york",
    region: "US",
    name: "New York",
    description: "City accent patterns, rhythm, and local idioms.",
    isFoundational: false,
    unlockThreshold: UNLOCK_THRESHOLD,
  },
  {
    id: "received-pronunciation",
    region: "GB",
    name: "Received Pronunciation / General British (GB)",
    description: "Standard British grammar, tenses, and RP pronunciation.",
    isFoundational: true,
    unlockThreshold: UNLOCK_THRESHOLD,
  },
  {
    id: "cockney",
    region: "GB",
    name: "Cockney",
    description: "East London accent, rhyming slang, and glottal stops.",
    isFoundational: false,
    unlockThreshold: UNLOCK_THRESHOLD,
  },
  {
    id: "scottish",
    region: "GB",
    name: "Scottish",
    description: "Scottish vowels, rolled R, and regional vocabulary.",
    isFoundational: false,
    unlockThreshold: UNLOCK_THRESHOLD,
  },
];

export const ERROR_CATEGORY_LABELS: Record<string, string> = {
  grammar: "Grammar",
  pronunciation: "Pronunciation",
  vocabulary: "Vocabulary",
  structure: "Structure & Phonetics",
};
