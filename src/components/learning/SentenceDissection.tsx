"use client";

import { motion } from "framer-motion";
import { getSegmentColorClass } from "@/lib/linguistic-rules";
import type { SentenceSegment } from "@/types";

interface SentenceDissectionProps {
  sentence: string;
  segments: SentenceSegment[];
  showLegend?: boolean;
}

export function SentenceDissection({
  sentence,
  segments,
  showLegend = true,
}: SentenceDissectionProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4">
        <p className="mb-3 text-xs uppercase tracking-wide text-slate-500">
          Structural Dissection
        </p>
        <div className="flex flex-wrap gap-1.5">
          {segments.map((segment, index) => (
            <motion.span
              key={`${segment.text}-${index}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className={`inline-flex flex-col rounded-lg px-2.5 py-1.5 ring-1 ${getSegmentColorClass(segment.role)}`}
            >
              <span className="text-sm font-medium">{segment.text}</span>
              <span className="text-[10px] uppercase opacity-70">{segment.label}</span>
            </motion.span>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">Full: {sentence}</p>
      </div>

      {showLegend && (
        <div className="space-y-2">
          {segments.map((segment, index) => (
            <div
              key={`logic-${index}`}
              className="flex gap-3 rounded-lg border border-white/5 bg-slate-800/40 px-3 py-2"
            >
              <span
                className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ring-1 ${getSegmentColorClass(segment.role)}`}
              >
                {segment.label}
              </span>
              <p className="text-sm text-slate-300">{segment.logic}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
