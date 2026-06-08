"use client";

import { motion } from "framer-motion";
import { Mic, Play, Square, Volume2 } from "lucide-react";
import { useState } from "react";
import { LearningPageShell } from "@/components/learning/LearningPageShell";
import { WaveformCompare } from "@/components/learning/WaveformCompare";
import { useLearning } from "@/context/LearningContext";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useCategoryMistakes } from "@/hooks/useCategoryMistakes";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { getPhonemeGuides } from "@/lib/learning-content";

export function PronunciationPage() {
  const { region } = useLearning();
  const mistakes = useCategoryMistakes("pronunciation");
  const phonemes = getPhonemeGuides(region ?? "US");
  const [activePhoneme, setActivePhoneme] = useState(phonemes[0]?.id ?? "");

  const {
    isRecording,
    audioUrl,
    waveform,
    error: recordError,
    startRecording,
    stopRecording,
    clearRecording,
  } = useAudioRecorder();

  const { isSpeaking, nativeWaveform, speak, stop } = useSpeechSynthesis();

  const selected = phonemes.find((item) => item.id === activePhoneme) ?? phonemes[0];
  const speechLang = region === "GB" ? "en-GB" : "en-US";

  const chatPhrase = mistakes[0]?.correctForm;
  const practicePhrase =
    chatPhrase ?? selected?.practicePhrase ?? "Practice makes perfect";

  const handlePlayNative = () => {
    clearRecording();
    speak(practicePhrase, speechLang);
  };

  return (
    <LearningPageShell
      title="Pronunciation Lab"
      subtitle="Visual phonetics and accent mimicry practice"
      methodology="Visual Accent Mimicry & Phonetic Placement"
      icon={<Volume2 className="h-5 w-5" />}
      personalizedMistakes={mistakes}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Phoneme Placement Guide
          </h2>

          <div className="flex flex-wrap gap-2">
            {phonemes.map((phoneme) => (
              <button
                key={phoneme.id}
                type="button"
                onClick={() => setActivePhoneme(phoneme.id)}
                className={`rounded-full px-4 py-1.5 text-sm transition ${
                  activePhoneme === phoneme.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                /{phoneme.symbol}/ {phoneme.name}
              </button>
            ))}
          </div>

          {selected && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-white/10 bg-slate-900/60 p-6"
            >
              <div className="flex gap-6">
                <div className="relative flex h-48 w-36 shrink-0 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30 bg-gradient-to-b from-slate-800 to-slate-900" />
                  <div className="absolute bottom-4 left-1/2 h-16 w-20 -translate-x-1/2 rounded-t-full bg-rose-400/30 blur-sm" />
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="relative z-10 h-10 w-14 rounded-b-full bg-error-amber/60"
                  />
                  <p className="absolute -bottom-1 text-[10px] text-slate-500">
                    Tongue / Lips
                  </p>
                </div>

                <div className="flex-1">
                  <p className="font-mono text-2xl text-error-amber">/{selected.symbol}/</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">
                    {selected.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-300">{selected.description}</p>
                  <div className="mt-4 space-y-2 text-sm">
                    <p>
                      <span className="text-slate-500">Tongue: </span>
                      <span className="text-slate-200">{selected.tonguePosition}</span>
                    </p>
                    <p>
                      <span className="text-slate-500">Lips: </span>
                      <span className="text-slate-200">{selected.lipPosition}</span>
                    </p>
                    <p>
                      <span className="text-slate-500">Example: </span>
                      <span className="text-emerald-400">{selected.exampleWord}</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Audio Mimic Challenge
          </h2>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-wide text-indigo-300">
              Practice phrase
              {mistakes[0] && (
                <span className="ml-2 text-error-amber">(from your chat)</span>
              )}
            </p>
            <p className="mt-2 text-lg font-medium text-white">{practicePhrase}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handlePlayNative}
                disabled={isSpeaking}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                Play Native
              </button>
              {isSpeaking && (
                <button
                  type="button"
                  onClick={stop}
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"
                >
                  <Square className="h-4 w-4" />
                  Stop
                </button>
              )}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
                  isRecording
                    ? "bg-error-amber text-slate-900"
                    : "border border-error-amber/40 text-error-amber hover:bg-error-amber/10"
                }`}
              >
                <Mic className="h-4 w-4" />
                {isRecording ? "Stop Recording" : "Record Yourself"}
              </button>
            </div>

            {recordError && (
              <p className="mt-3 text-sm text-error-amber">{recordError}</p>
            )}

            {audioUrl && (
              <audio src={audioUrl} controls className="mt-4 w-full" />
            )}

            <div className="mt-6">
              <WaveformCompare
                nativeWaveform={nativeWaveform}
                userWaveform={waveform}
              />
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Compare pacing and intonation — gaps in the yellow wave often show
              where rhythm drifted from the native pattern.
            </p>
          </div>
        </section>
      </div>
    </LearningPageShell>
  );
}
