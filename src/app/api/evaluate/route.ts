import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";
import { buildEvaluationPrompt } from "@/lib/prompts";
import type { LevelDefinition } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      transcript: string;
      level: LevelDefinition;
      expectedPhrase?: string;
    };

    const { transcript, level, expectedPhrase } = body;

    if (!transcript?.trim() || !level) {
      return NextResponse.json(
        { error: "Transcript and level are required." },
        { status: 400 },
      );
    }

    const prompt = buildEvaluationPrompt(level, transcript, expectedPhrase);

    const response = await callOpenRouter(
      [
        {
          role: "system",
          content:
            "You are a pronunciation evaluator. Return ONLY valid JSON, no markdown.",
        },
        { role: "user", content: prompt },
      ],
      { temperature: 0.3, maxTokens: 600 },
    );

    const cleaned = response.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned) as {
      transcript: string;
      accuracy: number;
      errors: Array<{
        category: string;
        userSaid: string;
        correctForm: string;
      }>;
      feedback: string;
    };

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Evaluate API error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to evaluate speech.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
