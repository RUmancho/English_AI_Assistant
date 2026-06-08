import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";
import { buildSystemPrompt } from "@/lib/prompts";
import type { LevelDefinition, VocabularyItem } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      level: LevelDefinition;
      vocabulary: VocabularyItem[];
      mode: "text" | "audio";
      masteredRuleIds?: string[];
      formalityLevel?: number;
    };

    const { messages, level, vocabulary, mode, masteredRuleIds, formalityLevel } =
      body;

    if (!messages?.length || !level) {
      return NextResponse.json(
        { error: "Messages and level are required." },
        { status: 400 },
      );
    }

    const systemPrompt = buildSystemPrompt(
      level,
      vocabulary ?? [],
      masteredRuleIds ?? [],
      formalityLevel ?? 5,
    );
    const modeHint =
      mode === "audio"
        ? "The user is in AUDIO MODE. They spoke via microphone — evaluate pronunciation, phonetics, AND formality of the transcript carefully."
        : "The user is in TEXT MODE.";
    const formalityHint = `Current formality target: ${formalityLevel ?? 5}. Evaluate the user's latest message against this target.`;

    const response = await callOpenRouter([
      {
        role: "system",
        content: `${systemPrompt}\n\n${modeHint}\n\n${formalityHint}`,
      },
      ...messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ]);

    return NextResponse.json({ content: response });
  } catch (error) {
    console.error("Chat API error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate response.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
