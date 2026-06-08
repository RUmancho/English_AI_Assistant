import type { DissectionRole, Region, RuleChainType, SentenceSegment } from "@/types";

export interface PracticeItem {
  id: string;
  prompt: string;
  brokenSentence?: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface DeepLinguisticRule {
  id: string;
  order: number;
  chainType: RuleChainType;
  title: string;
  principle: "core-sentence" | "to-be-marker" | "v3-principle" | "aspect-bridge" | "chunk-lexical" | "rhythm-shadow";
  coreLogic: string;
  deepExplanation: string;
  exampleSentence: string;
  segments: SentenceSegment[];
  practiceItems: PracticeItem[];
}

const SEGMENT_COLORS: Record<DissectionRole, string> = {
  subject: "bg-indigo-500/30 text-indigo-200 ring-indigo-400/50",
  timeMarker: "bg-violet-500/30 text-violet-200 ring-violet-400/50",
  aspectTransfer: "bg-cyan-500/30 text-cyan-200 ring-cyan-400/50",
  tenseTransfer: "bg-blue-500/30 text-blue-200 ring-blue-400/50",
  v3Participle: "bg-error-amber/25 text-error-amber ring-error-amber/50",
  stateDescriptor: "bg-emerald-500/25 text-emerald-300 ring-emerald-400/50",
  chunk: "bg-fuchsia-500/25 text-fuchsia-200 ring-fuchsia-400/50",
  object: "bg-slate-600/50 text-slate-200 ring-slate-400/40",
  auxiliary: "bg-rose-500/25 text-rose-200 ring-rose-400/40",
};

export function getSegmentColorClass(role: DissectionRole): string {
  return SEGMENT_COLORS[role];
}

const GRAMMAR_CHAIN: DeepLinguisticRule[] = [
  {
    id: "grammar-1-core-sentence",
    order: 1,
    chainType: "grammar",
    title: "The Core Sentence Rule",
    principle: "core-sentence",
    coreLogic:
      "Every natural English sentence performs exactly ONE clear transfer of Time (Tense) and ONE clear transfer of Aspect.",
    deepExplanation:
      "Do not stack multiple time shifts in one clause. 'I went and had eaten' breaks the rule — pick one time frame, one aspect view. Time = WHEN. Aspect = HOW the action is viewed (finished, ongoing, connected to now).",
    exampleSentence: "She has been reading the report.",
    segments: [
      { text: "She", role: "subject", label: "Subject", logic: "Who acts" },
      { text: "has", role: "timeMarker", label: "Time Marker", logic: "Links action to NOW" },
      { text: "been", role: "aspectTransfer", label: "Aspect Transfer", logic: "Ongoing frame — not finished" },
      { text: "reading", role: "tenseTransfer", label: "Tense Transfer", logic: "The action in progress" },
      { text: "the report", role: "object", label: "Object", logic: "What receives the action" },
    ],
    practiceItems: [
      {
        id: "g1-p1",
        prompt: "Which sentence respects ONE Time + ONE Aspect transfer?",
        options: [
          "I am went to the store yesterday.",
          "I went to the store yesterday.",
          "I have went and was going.",
        ],
        correctAnswer: "I went to the store yesterday.",
        explanation: "Single past time transfer — no conflicting aspects.",
      },
      {
        id: "g1-p2",
        prompt: "Identify the broken sentence:",
        options: [
          "They are working now.",
          "He has finished the task.",
          "She is was tired.",
        ],
        correctAnswer: "She is was tired.",
        explanation: "Two time markers (is + was) — violates the core rule.",
      },
    ],
  },
  {
    id: "grammar-2-to-be-marker",
    order: 2,
    chainType: "grammar",
    title: "The 'To Be' Time Marker",
    principle: "to-be-marker",
    coreLogic:
      "'To be' is not merely a verb — it is a structural Time Marker that anchors the sentence to a time frame.",
    deepExplanation:
      "When you say 'is', 'am', 'was', 'were', you are placing the entire clause on a timeline. The main verb that follows often describes a state or ongoing aspect INSIDE that time frame — not a new time jump.",
    exampleSentence: "The children are excited about the trip.",
    segments: [
      { text: "The children", role: "subject", label: "Subject", logic: "Who" },
      { text: "are", role: "timeMarker", label: "Time Marker (to be)", logic: "Anchors clause to PRESENT" },
      { text: "excited", role: "stateDescriptor", label: "State", logic: "Condition inside that time frame" },
      { text: "about the trip", role: "object", label: "Prep. phrase", logic: "Context for the state" },
    ],
    practiceItems: [
      {
        id: "g2-p1",
        prompt: "What is 'was' doing in: 'He was nervous'?",
        options: [
          "A regular action verb",
          "A structural Time Marker",
          "A past participle (V3)",
        ],
        correctAnswer: "A structural Time Marker",
        explanation: "'Was' places the state in past time — it does not describe the action itself.",
      },
      {
        id: "g2-p2",
        brokenSentence: "She are happy yesterday.",
        prompt: "Fix the time marker mismatch:",
        correctAnswer: "She was happy yesterday.",
        explanation: "'Yesterday' demands past time marker 'was', not present 'are'.",
      },
    ],
  },
  {
    id: "grammar-3-v3-principle",
    order: 3,
    chainType: "grammar",
    title: "The V3 Principle",
    principle: "v3-principle",
    coreLogic:
      "The 3rd verb form (V3 / Past Participle) acts simultaneously as an Adjective AND a Verb — it describes a resulting state.",
    deepExplanation:
      "'The window is broken' is NOT abstract grammar — it is logic. Someone broke it (action, past). NOW the window EXISTS in a broken state. 'Broken' is V3 functioning as a state descriptor — a passive structure bridging action to present reality.",
    exampleSentence: "The window is broken.",
    segments: [
      { text: "The window", role: "subject", label: "Subject", logic: "The entity in a state" },
      { text: "is", role: "timeMarker", label: "Time Marker", logic: "State exists NOW" },
      { text: "broken", role: "v3Participle", label: "V3 (Adj + Verb)", logic: "Result state from past action" },
    ],
    practiceItems: [
      {
        id: "g3-p1",
        prompt: "In 'The door is locked', what role does 'locked' play?",
        options: [
          "Active verb only",
          "V3 describing a resulting state",
          "Future tense marker",
        ],
        correctAnswer: "V3 describing a resulting state",
        explanation: "Locked = someone locked it before; now the door IS in that state.",
      },
      {
        id: "g3-p2",
        prompt: "Which uses V3 as a state descriptor?",
        options: [
          "She breaks the cup.",
          "The cup is broken.",
          "She will break the cup.",
        ],
        correctAnswer: "The cup is broken.",
        explanation: "Passive state — V3 'broken' describes current condition.",
      },
    ],
  },
  {
    id: "grammar-4-aspect-bridge",
    order: 4,
    chainType: "grammar",
    title: "Aspect Bridge: Have/Has + V3",
    principle: "aspect-bridge",
    coreLogic:
      "Have/has + V3 connects a past action to the present moment — one Time Marker, one Aspect transfer.",
    deepExplanation:
      "'I have finished' = the finishing happened in the past, but the RESULT lives in now. You are not double-jumping time — 'have' marks present relevance, V3 marks completed aspect.",
    exampleSentence: "I have finished the assignment.",
    segments: [
      { text: "I", role: "subject", label: "Subject", logic: "Speaker" },
      { text: "have", role: "timeMarker", label: "Time Marker", logic: "Present relevance" },
      { text: "finished", role: "v3Participle", label: "V3 Aspect", logic: "Completed — result is now" },
      { text: "the assignment", role: "object", label: "Object", logic: "What was completed" },
    ],
    practiceItems: [
      {
        id: "g4-p1",
        prompt: "Why is 'I have ate' incorrect?",
        options: [
          "Needs V3 'eaten', not V2 'ate'",
          "Needs future tense",
          "Needs passive voice",
        ],
        correctAnswer: "Needs V3 'eaten', not V2 'ate'",
        explanation: "Have/has always demands V3 — the aspect bridge requires the participle form.",
      },
      {
        id: "g4-p2",
        brokenSentence: "She has went home.",
        prompt: "Apply the V3 principle to fix:",
        correctAnswer: "She has gone home.",
        explanation: "'Gone' is V3 — 'went' is V2 (past simple), incompatible with 'has'.",
      },
    ],
  },
];

const STRUCTURE_CHAIN: DeepLinguisticRule[] = [
  {
    id: "structure-1-core-transfer",
    order: 1,
    chainType: "structure",
    title: "Structural Time + Aspect in Chunks",
    principle: "core-sentence",
    coreLogic:
      "Native speakers package ONE time transfer and ONE aspect transfer inside multi-word chunks — not word by word.",
    deepExplanation:
      "Instead of assembling isolated words, English moves as blocks: 'I've been' = one time-aspect chunk. Breaking chunks breaks natural rhythm.",
    exampleSentence: "I've been thinking about it.",
    segments: [
      { text: "I've been", role: "chunk", label: "Time+Aspect Chunk", logic: "Present relevance + ongoing" },
      { text: "thinking about it", role: "chunk", label: "Action Chunk", logic: "The ongoing mental action" },
    ],
    practiceItems: [
      {
        id: "s1-p1",
        prompt: "Which groups words into a native chunk?",
        options: [
          "I / have / been / thinking",
          "I've been / thinking about it",
          "Ive / been thinking / about / it",
        ],
        correctAnswer: "I've been / thinking about it",
        explanation: "Time-aspect chunk first, then action chunk — how natives process it.",
      },
      {
        id: "s1-p2",
        prompt: "The chunk 'gonna' compresses which structure?",
        options: ["going to (future intention)", "gone to (past)", "goes to (habit)"],
        correctAnswer: "going to (future intention)",
        explanation: "Informal contraction = one structural chunk for intention.",
      },
    ],
  },
  {
    id: "structure-2-lexical-chunks",
    order: 2,
    chainType: "structure",
    title: "Lexical Chunks vs. Isolated Words",
    principle: "chunk-lexical",
    coreLogic:
      "Store and retrieve language in multi-word blocks (lexical approach) — idioms, collocations, and fixed frames.",
    deepExplanation:
      "'Make sense', 'by the way', 'kind of' are not translated word-by-word. They are single units with structural meaning — learning them as chunks builds native-like fluency.",
    exampleSentence: "It doesn't make sense to me.",
    segments: [
      { text: "It", role: "subject", label: "Subject", logic: "Dummy subject" },
      { text: "doesn't make sense", role: "chunk", label: "Lexical Chunk", logic: "Fixed frame = 'is logical'" },
      { text: "to me", role: "object", label: "Perspective", logic: "Whose viewpoint" },
    ],
    practiceItems: [
      {
        id: "s2-p1",
        prompt: "Which is a lexical chunk (learn as one unit)?",
        options: ["make / sense", "make sense", "makes / no / sense"],
        correctAnswer: "make sense",
        explanation: "Fixed collocation — never split in natural speech.",
      },
      {
        id: "s2-p2",
        prompt: "Complete the chunk: 'By the ___'",
        options: ["way", "time", "road"],
        correctAnswer: "way",
        explanation: "'By the way' = topic-shift chunk, stored as one block.",
      },
    ],
  },
  {
    id: "structure-3-contractions",
    order: 3,
    chainType: "structure",
    title: "Fast-Spoken Contraction Structures",
    principle: "aspect-bridge",
    coreLogic:
      "Informal American contractions (wanna, gonna, kinda, gotta, lemme) are structural shortcuts — evaluated in the main chat arena.",
    deepExplanation:
      "These are not 'bad English' — they are compressed native structures. 'Wanna' = want + to (intention chunk). 'Gonna' = going + to. Using them naturally in chat signals real fluency.",
    exampleSentence: "I kinda wanna go, but I gotta finish this.",
    segments: [
      { text: "I", role: "subject", label: "Subject", logic: "Speaker" },
      { text: "kinda wanna", role: "chunk", label: "Soft intention chunk", logic: "kind of + want to" },
      { text: "go", role: "tenseTransfer", label: "Action", logic: "Base verb after chunk" },
      { text: "but I gotta finish this", role: "chunk", label: "Obligation chunk", logic: "got to = must" },
    ],
    practiceItems: [
      {
        id: "s3-p1",
        prompt: "What does 'lemme' expand to?",
        options: ["let me", "less me", "leave me"],
        correctAnswer: "let me",
        explanation: "'Lemme' = let me — permission/request chunk.",
      },
      {
        id: "s3-p2",
        prompt: "Expand 'gonna' in: 'We're gonna leave.'",
        correctAnswer: "going to",
        explanation: "Gonna = going to — future intention structure.",
      },
    ],
  },
  {
    id: "structure-4-shadowing-rhythm",
    order: 4,
    chainType: "structure",
    title: "Shadowing Rhythm Patterns",
    principle: "rhythm-shadow",
    coreLogic:
      "Match native rhythm by shadowing chunk boundaries — stress falls on content chunks, not every word.",
    deepExplanation:
      "Shadowing means speaking simultaneously with a slight delay, aligning your chunk stress to the model. Yellow highlights mark where your rhythm matched the native structural pattern.",
    exampleSentence: "At the end of the day, it is what it is.",
    segments: [
      { text: "At the end of the day,", role: "chunk", label: "Discourse chunk", logic: "Summary frame" },
      { text: "it is", role: "timeMarker", label: "Time marker chunk", logic: "Present state" },
      { text: "what it is.", role: "chunk", label: "Acceptance chunk", logic: "Fixed idiomatic frame" },
    ],
    practiceItems: [
      {
        id: "s4-p1",
        prompt: "Which chunk carries the main stress in 'I KINDA wanna GO'?",
        options: ["kinda wanna (intention block)", "I (subject only)", "GO (only verb)"],
        correctAnswer: "kinda wanna (intention block)",
        explanation: "Stress the structural chunk, not isolated syllables.",
      },
      {
        id: "s4-p2",
        prompt: "Shadowing aligns your rhythm to:",
        options: [
          "Native chunk boundaries",
          "Individual letters",
          "Random word order",
        ],
        correctAnswer: "Native chunk boundaries",
        explanation: "Rhythm follows multi-word blocks — the lexical approach in motion.",
      },
    ],
  },
];

export function getRuleChain(
  chainType: RuleChainType,
  region: Region,
): DeepLinguisticRule[] {
  void region;
  return chainType === "grammar" ? GRAMMAR_CHAIN : STRUCTURE_CHAIN;
}

export function getRuleById(ruleId: string): DeepLinguisticRule | undefined {
  return [...GRAMMAR_CHAIN, ...STRUCTURE_CHAIN].find((rule) => rule.id === ruleId);
}

export const INFORMAL_CONTRACTIONS = [
  "wanna",
  "gonna",
  "kinda",
  "gotta",
  "lemme",
  "gimme",
  "dunno",
  "coulda",
  "woulda",
  "shoulda",
  "outta",
  "sorta",
  "lotta",
];
