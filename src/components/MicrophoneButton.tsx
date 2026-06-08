"use client";

import { motion } from "framer-motion";
import { Mic, MicOff, Square } from "lucide-react";

interface MicrophoneButtonProps {
  isListening: boolean;
  isSupported: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function MicrophoneButton({
  isListening,
  isSupported,
  onStart,
  onStop,
}: MicrophoneButtonProps) {
  if (!isSupported) {
    return (
      <button
        type="button"
        disabled
        title="Speech recognition not supported"
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-slate-500"
      >
        <MicOff className="h-5 w-5" />
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={isListening ? onStop : onStart}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative flex h-12 w-12 items-center justify-center rounded-xl transition ${
        isListening
          ? "bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/30"
          : "bg-indigo-600 text-white hover:bg-indigo-500"
      }`}
      title={isListening ? "Stop recording" : "Start Audio Mode"}
    >
      {isListening && (
        <motion.span
          className="absolute inset-0 rounded-xl border-2 border-amber-300"
          animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}
      {isListening ? (
        <Square className="h-5 w-5 fill-current" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </motion.button>
  );
}
