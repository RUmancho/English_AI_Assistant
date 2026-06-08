"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BookMarked, Check, RotateCcw, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { LearningPageShell } from "@/components/learning/LearningPageShell";
import { useLearning } from "@/context/LearningContext";
import { useCategoryMistakes } from "@/hooks/useCategoryMistakes";
import { DIALECT_PAIRS } from "@/lib/learning-content";

interface FlashcardItem {
  word: string;
  definition: string;
  source: "chat" | "srs";
}

export function VocabularyPage() {
  const { vocabulary, region, activeLevelId, applyTutorMetadata } = useLearning();
  const mistakes = useCategoryMistakes("vocabulary");
  const [reviewTimestamp] = useState(() => Date.now());

  const flashcards = useMemo((): FlashcardItem[] => {
    const fromMistakes: FlashcardItem[] = mistakes.map((mistake) => ({
      word: mistake.userSaid,
      definition: mistake.correctForm,
      source: "chat" as const,
    }));

    const fromSrs: FlashcardItem[] = vocabulary
      .filter((item) => item.nextReview <= reviewTimestamp || item.failures > 0)
      .map((item) => ({
        word: item.word,
        definition: item.definition,
        source: "srs" as const,
      }));

    const combined = [...fromMistakes, ...fromSrs];
    if (combined.length === 0) {
      return [
        { word: "schedule", definition: "timetable / plan of events", source: "srs" },
        { word: "quite", definition: "fairly / rather (UK) vs very (US context)", source: "srs" },
      ];
    }
    return combined;
  }, [mistakes, vocabulary, reviewTimestamp]);

  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [gameIndex, setGameIndex] = useState(0);
  const [gameAnswer, setGameAnswer] = useState("");
  const [gameFeedback, setGameFeedback] = useState<"idle" | "correct" | "wrong">("idle");

  const currentCard = flashcards[cardIndex % flashcards.length];
  const gamePairs = DIALECT_PAIRS;
  const currentPair = gamePairs[gameIndex % gamePairs.length];

  const promptSide = region === "US" ? "british" : "american";
  const answerSide = region === "US" ? "american" : "british";
  const promptWord = currentPair[promptSide];
  const expectedAnswer = currentPair[answerSide];
  const promptExample =
    promptSide === "british"
      ? currentPair.britishExample
      : currentPair.americanExample;

  const nextCard = useCallback(() => {
    setFlipped(false);
    setCardIndex((prev) => prev + 1);
  }, []);

  const markCard = useCallback(
    (remembered: boolean) => {
      if (activeLevelId && currentCard) {
        applyTutorMetadata(
          {
            errors: [],
            vocabularyUpdates: [
              {
                word: currentCard.word,
                definition: currentCard.definition,
                failed: !remembered,
              },
            ],
            practiceScoreDelta: remembered ? 0.015 : 0,
            theoryScoreDelta: 0.005,
          },
          activeLevelId,
        );
      }
      nextCard();
    },
    [activeLevelId, applyTutorMetadata, currentCard, nextCard],
  );

  const checkDialectAnswer = () => {
    const normalized = gameAnswer.trim().toLowerCase();
    const expected = expectedAnswer.toLowerCase();
    const isCorrect =
      normalized === expected ||
      normalized.includes(expected) ||
      expected.includes(normalized);

    setGameFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect && activeLevelId) {
      applyTutorMetadata(
        {
          errors: [],
          vocabularyUpdates: [
            {
              word: promptWord,
              definition: expectedAnswer,
              failed: false,
            },
          ],
          practiceScoreDelta: 0.02,
          theoryScoreDelta: 0.005,
        },
        activeLevelId,
      );
    }
  };

  const nextGameRound = () => {
    setGameAnswer("");
    setGameFeedback("idle");
    setGameIndex((prev) => prev + 1);
  };

  return (
    <LearningPageShell
      title="Vocabulary Vault"
      subtitle="Active recall with dialect-aware synonym mapping"
      methodology="Spaced Repetition (SRS) + Dialect Synonyms Mapping"
      icon={<BookMarked className="h-5 w-5" />}
      personalizedMistakes={mistakes}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            SRS Flashcards
          </h2>

          <div className="perspective-1000 relative mx-auto h-64 max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${cardIndex}-${flipped}`}
                initial={{ opacity: 0, rotateY: flipped ? -90 : 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: flipped ? 90 : -90 }}
                transition={{ duration: 0.35 }}
                onClick={() => setFlipped((value) => !value)}
                className="absolute inset-0 cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-8 shadow-xl"
              >
                {!flipped ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <p className="text-xs uppercase tracking-wide text-indigo-300">
                      {currentCard?.source === "chat"
                        ? "From your chat"
                        : "Spaced repetition"}
                    </p>
                    <p className="mt-4 text-3xl font-bold text-white">
                      {currentCard?.word}
                    </p>
                    <p className="mt-4 text-sm text-slate-500">Tap to reveal</p>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <p className="text-xs uppercase tracking-wide text-error-amber">
                      Correct form / meaning
                    </p>
                    <p className="mt-4 text-xl font-medium text-emerald-400">
                      {currentCard?.definition}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {flipped && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center gap-3"
            >
              <button
                type="button"
                onClick={() => markCard(false)}
                className="flex items-center gap-2 rounded-xl border border-error-amber/40 px-5 py-2.5 text-sm text-error-amber hover:bg-error-amber/10"
              >
                <X className="h-4 w-4" />
                Need practice
              </button>
              <button
                type="button"
                onClick={() => markCard(true)}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm text-white hover:bg-emerald-500"
              >
                <Check className="h-4 w-4" />
                Got it!
              </button>
            </motion.div>
          )}

          <p className="text-center text-xs text-slate-500">
            Card {((cardIndex % flashcards.length) + 1)} of {flashcards.length}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Dialect Transformer
          </h2>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <p className="text-xs uppercase tracking-wide text-indigo-300">
              {region === "US" ? "British → American" : "American → British"}
            </p>

            <div className="mt-4 rounded-lg bg-slate-800/80 p-4">
              <p className="text-2xl font-bold text-white">{promptWord}</p>
              <p className="mt-2 text-sm italic text-slate-400">
                &ldquo;{promptExample}&rdquo;
              </p>
            </div>

            <input
              type="text"
              value={gameAnswer}
              onChange={(event) => {
                setGameAnswer(event.target.value);
                setGameFeedback("idle");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  checkDialectAnswer();
                }
              }}
              placeholder={`Type the ${answerSide === "american" ? "American" : "British"} equivalent...`}
              className="mt-4 w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-3 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
            />

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={checkDialectAnswer}
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Check Match
              </button>
              <button
                type="button"
                onClick={nextGameRound}
                className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"
              >
                <RotateCcw className="h-4 w-4" />
                Skip
              </button>
            </div>

            <AnimatePresence>
              {gameFeedback !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-4 rounded-lg px-4 py-3 text-sm ${
                    gameFeedback === "correct"
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border border-error-amber/30 bg-error-amber/10 text-error-amber"
                  }`}
                >
                  {gameFeedback === "correct" ? (
                    "Perfect match! Contextual mapping strengthens retention."
                  ) : (
                    <>
                      Target: <span className="font-medium">{expectedAnswer}</span>
                      {" — "}
                      {answerSide === "american"
                        ? currentPair.americanExample
                        : currentPair.britishExample}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </LearningPageShell>
  );
}
