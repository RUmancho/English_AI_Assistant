import type { TutorMetadata } from "@/types";

const METADATA_PATTERN = /```tutor-metadata\s*([\s\S]*?)```/;

export function parseTutorMetadata(raw: string): {
  displayContent: string;
  metadata: TutorMetadata | null;
} {
  const match = raw.match(METADATA_PATTERN);
  if (!match) {
    return { displayContent: raw.trim(), metadata: null };
  }

  const displayContent = raw.replace(METADATA_PATTERN, "").trim();

  try {
    const parsed = JSON.parse(match[1]) as TutorMetadata;
    return { displayContent, metadata: parsed };
  } catch (error) {
    console.error("Failed to parse tutor metadata:", error);
    return { displayContent, metadata: null };
  }
}
