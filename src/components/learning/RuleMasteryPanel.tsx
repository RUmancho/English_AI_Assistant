"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Check, Dumbbell } from "lucide-react";
import { useState } from "react";
import { SentenceDissection } from "@/components/learning/SentenceDissection";
import type { DeepLinguisticRule } from "@/lib/linguistic-rules";

type MasteryStep = "theory" | "practice";

interface RuleMasteryPanelProps {
  rule: DeepLinguisticRule;
  theoryComplete: boolean;
  practiceComplete: boolean;
  onCompleteTheory: () => void;
  onCompletePractice: () => void;
}

export function RuleMasteryPanel({
  rule,
  theoryComplete,
  practiceComplete,
  onCompleteTheory,
  onCompletePractice,
}: RuleMasteryPanelProps) {
  const [step, setStep] = useState<MasteryStep>(
    theoryComplete ? "practice" : "theory",
  );
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");
  const [theoryAcknowledged, setTheoryAcknowledged] = useState(theoryComplete);

  const currentPractice = rule.practiceItems[practiceIndex];
  const allPracticeCorrect =
    practiceIndex >= rule.practiceItems.length - 1 && feedback === "correct";

  const handleTheoryComplete = () => {
    setTheoryAcknowledged(true);
    onCompleteTheory();
    setStep("practice");
  };

  const checkPracticeAnswer = (answer: string) => {
    const normalized = answer.trim().toLowerCase();
    const expected = currentPractice.correctAnswer.trim().toLowerCase();
    const isCorrect =
      normalized === expected ||
      normalized.includes(expected) ||
      expected.includes(normalized);

    if (isCorrect) {
      setFeedback("correct");
      if (practiceIndex < rule.practiceItems.length - 1) {
        setTimeout(() => {
          setPracticeIndex((prev) => prev + 1);
          setTypedAnswer("");
          setSelectedOption(null);
          setFeedback("idle");
        }, 900);
      } else if (mistakeCount === 0) {
        onCompletePractice();
      }
    } else {
      setMistakeCount((prev) => prev + 1);
      setFeedback("wrong");
    }
  };

  const resetPractice = () => {
    setPracticeIndex(0);
    setTypedAnswer("");
    setSelectedOption(null);
    setMistakeCount(0);
    setFeedback("idle");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-lg bg-slate-800/80 p-1 text-xs">
        <button
          type="button"
          onClick={() => setStep("theory")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 ${
            step === "theory" ? "bg-indigo-600 text-white" : "text-slate-400"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          1. Theory
          {theoryComplete && <Check className="h-3 w-3" />}
        </button>
        <button
          type="button"
          onClick={() => theoryComplete && setStep("practice")}
          disabled={!theoryComplete}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 ${
            step === "practice" ? "bg-indigo-600 text-white" : "text-slate-400"
          } ${!theoryComplete ? "opacity-40" : ""}`}
        >
          <Dumbbell className="h-3.5 w-3.5" />
          2. Practice
          {practiceComplete && <Check className="h-3 w-3" />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {step === "theory" ? (
          <motion.div
            key="theory"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                Core Logic
              </p>
              <p className="mt-2 text-sm font-medium text-white">{rule.coreLogic}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {rule.deepExplanation}
              </p>
            </div>

            <SentenceDissection
              sentence={rule.exampleSentence}
              segments={rule.segments}
            />

            {!theoryAcknowledged ? (
              <button
                type="button"
                onClick={handleTheoryComplete}
                className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-500"
              >
                I understand the structural breakdown — Continue to Practice
              </button>
            ) : (
              <p className="text-center text-sm text-emerald-400">
                Theory complete — proceed to Practice tab.
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="practice"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="rounded-xl border border-white/10 bg-slate-900/60 p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Practice {practiceIndex + 1}/{rule.practiceItems.length} — zero
                mistakes required
              </p>
              {mistakeCount > 0 && (
                <span className="rounded-full bg-error-amber/20 px-2 py-0.5 text-xs text-error-amber">
                  {mistakeCount} mistake{mistakeCount !== 1 ? "s" : ""} — retry
                </span>
              )}
            </div>

            <p className="text-sm font-medium text-white">{currentPractice.prompt}</p>

            {currentPractice.brokenSentence && (
              <p className="mt-2 rounded-lg bg-error-amber/10 px-3 py-2 text-sm text-error-amber">
                {currentPractice.brokenSentence}
              </p>
            )}

            {currentPractice.options ? (
              <div className="mt-4 space-y-2">
                {currentPractice.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSelectedOption(option);
                      setFeedback("idle");
                    }}
                    className={`block w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                      selectedOption === option
                        ? "border-indigo-400 bg-indigo-500/10 text-white"
                        : "border-white/10 text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    {option}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => selectedOption && checkPracticeAnswer(selectedOption)}
                  disabled={!selectedOption}
                  className="mt-2 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  Submit Answer
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={typedAnswer}
                  onChange={(event) => {
                    setTypedAnswer(event.target.value);
                    setFeedback("idle");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      checkPracticeAnswer(typedAnswer);
                    }
                  }}
                  placeholder="Type your answer..."
                  className="mt-4 w-full rounded-lg border border-white/10 bg-slate-800/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => checkPracticeAnswer(typedAnswer)}
                  className="mt-3 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
                >
                  Submit Answer
                </button>
              </>
            )}

            <AnimatePresence>
              {feedback !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-4 rounded-lg px-4 py-3 text-sm ${
                    feedback === "correct"
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border border-error-amber/30 bg-error-amber/10 text-error-amber"
                  }`}
                >
                  {feedback === "correct" ? (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      {allPracticeCorrect && mistakeCount === 0
                        ? "Rule mastered! Next rule unlocked."
                        : currentPractice.explanation}
                    </span>
                  ) : (
                    <>
                      {currentPractice.explanation}
                      {mistakeCount > 0 && (
                        <button
                          type="button"
                          onClick={resetPractice}
                          className="mt-2 block text-xs underline"
                        >
                          Reset practice (start over with zero mistakes)
                        </button>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {practiceComplete && (
              <p className="mt-4 text-center text-sm font-medium text-emerald-400">
                Practice complete — this rule is mastered.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
