import { INFORMAL_CONTRACTIONS } from "@/lib/linguistic-rules";

export const FORMALITY_MIN = 1;
export const FORMALITY_MAX = 10;
export const FORMALITY_DEFAULT = 5;
export const FORMALITY_TOLERANCE = 1;

const FORMAL_PATTERNS: RegExp[] = [
  /\bwhom\b/i,
  /\bit is imperative\b/i,
  /\bone ought\b/i,
  /\bshall\b/i,
  /\bthus\b/i,
  /\bhenceforth\b/i,
  /\bwherein\b/i,
  /\bnotwithstanding\b/i,
  /\bdo not\b/i,
  /\bcannot\b/i,
  /\bI would like to inquire\b/i,
  /\bI am writing to inform\b/i,
];

export function clampFormality(value: number): number {
  return Math.max(FORMALITY_MIN, Math.min(FORMALITY_MAX, Math.round(value)));
}

export function getFormalityRange(target: number): { min: number; max: number } {
  const clamped = clampFormality(target);
  return {
    min: Math.max(FORMALITY_MIN, clamped - FORMALITY_TOLERANCE),
    max: Math.min(FORMALITY_MAX, clamped + FORMALITY_TOLERANCE),
  };
}

export function getFormalityLabel(level: number): string {
  if (level <= 2) {
    return "Street Slang";
  }
  if (level <= 4) {
    return "Casual";
  }
  if (level <= 6) {
    return "Neutral";
  }
  if (level <= 8) {
    return "Professional";
  }
  return "Boardroom Formal";
}

export function estimateFormalityLevel(text: string): number {
  const lower = text.toLowerCase();
  let score = 5;

  const contractions = INFORMAL_CONTRACTIONS.filter((word) =>
    new RegExp(`\\b${word}\\b`, "i").test(lower),
  );
  score -= contractions.length * 1.5;

  const slangHits = ["yeah", "nah", "gonna", "wanna", "kinda", "gotta", "lemme", "dunno", "ain't", "y'all"].filter(
    (word) => new RegExp(`\\b${word}\\b`, "i").test(lower),
  );
  score -= slangHits.length * 0.8;

  const formalHits = FORMAL_PATTERNS.filter((pattern) => pattern.test(text));
  score += formalHits.length * 1.8;

  if (/\b(do not|does not|did not|will not|cannot)\b/i.test(text)) {
    score += 1;
  }

  return clampFormality(score);
}

export function checkFormalityViolation(
  text: string,
  targetLevel: number,
): { violated: boolean; detectedLevel: number; message: string } {
  const range = getFormalityRange(targetLevel);
  const detectedLevel = estimateFormalityLevel(text);

  if (detectedLevel >= range.min && detectedLevel <= range.max) {
    return { violated: false, detectedLevel, message: "" };
  }

  const tooFormal = detectedLevel > range.max;
  const message = tooFormal
    ? "Context Alert: Your formality level is too high for this setting! Try more casual, spoken phrasing or contractions."
    : "Context Alert: Your formality level is too low for this setting! Avoid heavy slang and informal contractions like wanna, gonna, kinda.";

  return { violated: true, detectedLevel, message };
}

export function buildFormalityWarning(
  targetLevel: number,
  detectedLevel: number,
  aiWarning?: string,
): string {
  if (aiWarning?.trim()) {
    return aiWarning.trim();
  }

  const range = getFormalityRange(targetLevel);
  if (detectedLevel > range.max) {
    return `Context Alert: Your formality level is too high for this setting! (Detected ~${detectedLevel}, target ${targetLevel}, range ${range.min}–${range.max})`;
  }
  return `Context Alert: Your formality level is too low for this setting! (Detected ~${detectedLevel}, target ${targetLevel}, range ${range.min}–${range.max})`;
}
