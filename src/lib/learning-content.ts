import type { Region } from "@/types";

export interface GrammarRuleCard {
  id: string;
  title: string;
  pattern: string;
  example: string;
  hint: string;
}

export interface PhonemeGuide {
  id: string;
  symbol: string;
  name: string;
  description: string;
  tonguePosition: string;
  lipPosition: string;
  exampleWord: string;
  practicePhrase: string;
}

export interface DialectPair {
  british: string;
  american: string;
  britishExample: string;
  americanExample: string;
}

export interface ChunkExercise {
  id: string;
  chunk: string;
  meaning: string;
  fullSentence: string;
  chunks: string[];
}

const GRAMMAR_RULES_US: GrammarRuleCard[] = [
  {
    id: "present-simple",
    title: "Present Simple",
    pattern: "Subject + base verb (+ s/es for he/she/it)",
    example: "She walks to work every day.",
    hint: "Use for habits and facts — notice the -s on third person.",
  },
  {
    id: "past-simple",
    title: "Past Simple",
    pattern: "Subject + past tense verb (regular: -ed)",
    example: "I visited Chicago last summer.",
    hint: "One finished action in the past — time word often included.",
  },
  {
    id: "word-order",
    title: "Statement Word Order",
    pattern: "Subject → Verb → Object → (Place) → (Time)",
    example: "We eat dinner at home on Fridays.",
    hint: "Time usually comes last in neutral American statements.",
  },
  {
    id: "articles",
    title: "Articles (a / an / the)",
    pattern: "a + consonant sound · an + vowel sound · the = specific",
    example: "An hour later, I saw the movie.",
    hint: "Listen to the next sound, not just the letter.",
  },
];

const GRAMMAR_RULES_GB: GrammarRuleCard[] = [
  {
    id: "present-perfect",
    title: "Present Perfect",
    pattern: "have/has + past participle",
    example: "I've already finished my tea.",
    hint: "Links past action to now — very common in British English.",
  },
  {
    id: "past-simple",
    title: "Past Simple",
    pattern: "Subject + past tense verb",
    example: "She studied at Oxford last year.",
    hint: "Finished past events — British spelling may use -ise/-our.",
  },
  {
    id: "word-order",
    title: "Statement Word Order",
    pattern: "Subject → Verb → Object → (Manner) → (Place) → (Time)",
    example: "He reads quietly in the garden every evening.",
    hint: "Adverbs of manner often sit before place in British style.",
  },
  {
    id: "collective",
    title: "Collective Nouns",
    pattern: "Team/government/family → singular or plural verb",
    example: "The team are playing well today.",
    hint: "British English often treats groups as plural.",
  },
];

const PHONEMES_US: PhonemeGuide[] = [
  {
    id: "flap-t",
    symbol: "ɾ",
    name: "Flapped T",
    description: "Between vowels, American 't' often sounds like a quick 'd'.",
    tonguePosition: "Tip taps the alveolar ridge lightly",
    lipPosition: "Relaxed, slightly parted",
    exampleWord: "water → 'wader'",
    practicePhrase: "A little bit of butter",
  },
  {
    id: "rhotic-r",
    symbol: "r",
    name: "Rhotic R",
    description: "Americans pronounce 'r' in all positions, including after vowels.",
    tonguePosition: "Curl back without touching the roof",
    lipPosition: "Slightly rounded",
    exampleWord: "car, hard, bird",
    practicePhrase: "The early bird catches the worm",
  },
  {
    id: "ae-vowel",
    symbol: "æ",
    name: "Trap Vowel",
    description: "Open front vowel in 'cat', 'man', 'hand'.",
    tonguePosition: "Low and front in the mouth",
    lipPosition: "Spread wide",
    exampleWord: "cat, hand, plan",
    practicePhrase: "That man has a plan",
  },
];

const PHONEMES_GB: PhonemeGuide[] = [
  {
    id: "non-rhotic",
    symbol: "ə",
    name: "Non-Rhotic R",
    description: "RP often drops 'r' unless followed by a vowel.",
    tonguePosition: "Neutral — no American curl",
    lipPosition: "Relaxed",
    exampleWord: "car → 'cah', better → 'bettuh'",
    practicePhrase: "Park the car by the garden",
  },
  {
    id: "long-a",
    symbol: "ɑː",
    name: "BATH Vowel",
    description: "Long 'ah' in 'bath', 'dance', 'chance' in RP.",
    tonguePosition: "Low, back and open",
    lipPosition: "Neutral to slightly open",
    exampleWord: "bath, dance, chance",
    practicePhrase: "Dance in the garden path",
  },
  {
    id: "schwa",
    symbol: "ə",
    name: "Schwa",
    description: "The most common unstressed vowel in English.",
    tonguePosition: "Central, relaxed",
    lipPosition: "Neutral",
    exampleWord: "about, teacher, banana",
    practicePhrase: "A teacher ate a banana",
  },
];

export const DIALECT_PAIRS: DialectPair[] = [
  {
    british: "boot",
    american: "trunk",
    britishExample: "Put the bags in the boot.",
    americanExample: "Put the bags in the trunk.",
  },
  {
    british: "lift",
    american: "elevator",
    britishExample: "Take the lift to the third floor.",
    americanExample: "Take the elevator to the third floor.",
  },
  {
    british: "flat",
    american: "apartment",
    britishExample: "They rent a flat near the station.",
    americanExample: "They rent an apartment near the station.",
  },
  {
    british: "petrol",
    american: "gas",
    britishExample: "We need to buy petrol.",
    americanExample: "We need to buy gas.",
  },
  {
    british: "queue",
    american: "line",
    britishExample: "We waited in the queue.",
    americanExample: "We waited in line.",
  },
  {
    british: "holiday",
    american: "vacation",
    britishExample: "We're on holiday this week.",
    americanExample: "We're on vacation this week.",
  },
];

export const CHUNK_EXERCISES: ChunkExercise[] = [
  {
    id: "chunk-1",
    chunk: "by the way",
    meaning: "Introducing a new topic casually",
    fullSentence: "By the way, did you finish the report?",
    chunks: ["By the way,", "did you finish", "the report?"],
  },
  {
    id: "chunk-2",
    chunk: "kind of",
    meaning: "Softening a statement",
    fullSentence: "It's kind of difficult to explain.",
    chunks: ["It's kind of", "difficult to", "explain."],
  },
  {
    id: "chunk-3",
    chunk: "at the end of the day",
    meaning: "Ultimately / when everything is considered",
    fullSentence: "At the end of the day, we need results.",
    chunks: ["At the end of the day,", "we need", "results."],
  },
  {
    id: "chunk-4",
    chunk: "make sense",
    meaning: "To be logical or understandable",
    fullSentence: "Does that make sense to you?",
    chunks: ["Does that", "make sense", "to you?"],
  },
];

export function getGrammarRules(region: Region): GrammarRuleCard[] {
  return region === "US" ? GRAMMAR_RULES_US : GRAMMAR_RULES_GB;
}

export function getPhonemeGuides(region: Region): PhonemeGuide[] {
  return region === "US" ? PHONEMES_US : PHONEMES_GB;
}

export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function tokenizeSentence(sentence: string): string[] {
  return sentence
    .replace(/([.,!?;:])/g, " $1")
    .split(/\s+/)
    .filter(Boolean);
}
