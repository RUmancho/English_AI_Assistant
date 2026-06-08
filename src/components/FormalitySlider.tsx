"use client";

import { motion } from "framer-motion";
import {
  FORMALITY_MAX,
  FORMALITY_MIN,
  FORMALITY_TOLERANCE,
  getFormalityLabel,
  getFormalityRange,
} from "@/lib/formality";

interface FormalitySliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function FormalitySlider({
  value,
  onChange,
  disabled = false,
}: FormalitySliderProps) {
  const range = getFormalityRange(value);
  const percent = ((value - FORMALITY_MIN) / (FORMALITY_MAX - FORMALITY_MIN)) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-300">Formality Target</span>
        <span className="text-indigo-300">
          {value} · {getFormalityLabel(value)}
        </span>
      </div>

      <div className="relative px-1">
        <div className="relative h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="absolute inset-y-0 rounded-full opacity-40"
            style={{
              left: `${((range.min - FORMALITY_MIN) / (FORMALITY_MAX - FORMALITY_MIN)) * 100}%`,
              right: `${100 - ((range.max - FORMALITY_MIN) / (FORMALITY_MAX - FORMALITY_MIN)) * 100}%`,
              background:
                "linear-gradient(90deg, rgba(129,140,248,0.35), rgba(167,139,250,0.45))",
            }}
          />
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
            style={{ width: `${percent}%` }}
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        <input
          type="range"
          min={FORMALITY_MIN}
          max={FORMALITY_MAX}
          step={1}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
          className="formality-slider absolute inset-0 h-2 w-full cursor-pointer appearance-none bg-transparent disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Formality level"
          aria-valuemin={FORMALITY_MIN}
          aria-valuemax={FORMALITY_MAX}
          aria-valuenow={value}
        />
      </div>

      <div className="flex justify-between text-[10px] text-slate-500">
        <span>1 Street</span>
        <span className="text-error-amber/80">
          Acceptable: {range.min}–{range.max} (±{FORMALITY_TOLERANCE})
        </span>
        <span>10 Formal</span>
      </div>
    </div>
  );
}
