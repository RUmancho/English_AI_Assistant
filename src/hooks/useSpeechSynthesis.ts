"use client";

import { useCallback, useEffect, useState } from "react";

interface UseSpeechSynthesisReturn {
  isSpeaking: boolean;
  nativeWaveform: number[];
  speak: (text: string, lang?: string) => void;
  stop: () => void;
}

function generateSyntheticWaveform(text: string, samples = 120): number[] {
  const seed = text.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Array.from({ length: samples }, (_, index) => {
    const wave =
      Math.sin(index * 0.25 + seed * 0.01) * 0.4 +
      Math.sin(index * 0.08) * 0.3 +
      0.3;
    return Math.max(0.1, Math.min(1, wave));
  });
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [nativeWaveform, setNativeWaveform] = useState<number[]>([]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, lang = "en-US") => {
      if (!window.speechSynthesis) {
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setNativeWaveform(generateSyntheticWaveform(text));
      };

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [],
  );

  return { isSpeaking, nativeWaveform, speak, stop };
}
