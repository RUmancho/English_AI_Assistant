"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { useLearning } from "@/context/LearningContext";
import type { Region } from "@/types";

export function FlagSelection() {
  const { selectRegion } = useLearning();
  const [expanded, setExpanded] = useState(false);

  const paths: Array<{ region: Region; label: string; subtitle: string; flag: string }> = [
    {
      region: "GB",
      label: "British English",
      subtitle: "Received Pronunciation & regional UK dialects",
      flag: "🇬🇧",
    },
    {
      region: "US",
      label: "American English",
      subtitle: "General American & regional US dialects",
      flag: "🇺🇸",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl text-center"
      >
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-indigo-300">
          AI Language Learning Assistant
        </p>
        <h1 className="mb-3 text-4xl font-bold text-white md:text-5xl">
          Choose Your English Path
        </h1>
        <p className="mb-10 text-slate-400">
          Master grammar foundations first, then unlock regional dialects at 90%
          proficiency.
        </p>

        <motion.button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group mx-auto flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm transition hover:border-indigo-400/40"
        >
          <div className="relative flex h-36 items-center justify-center">
            <div className="absolute inset-0 flex">
              <div className="flex-1 bg-gradient-to-br from-blue-700 to-blue-900" />
              <div className="flex-1 bg-gradient-to-br from-red-600 via-white to-blue-800" />
            </div>
            <div className="relative z-10 flex items-center gap-3 rounded-full bg-black/40 px-6 py-3 backdrop-blur-md">
              <span className="text-3xl">🇬🇧</span>
              <span className="text-2xl text-white/60">+</span>
              <span className="text-3xl">🇺🇸</span>
            </div>
          </div>
          <div className="flex items-center justify-between px-6 py-4 text-left">
            <div>
              <p className="font-semibold text-white">English (UK & US)</p>
              <p className="text-sm text-slate-400">
                Tap to choose British or American path
              </p>
            </div>
            <ChevronRight
              className={`h-5 w-5 text-indigo-300 transition ${expanded ? "rotate-90" : ""}`}
            />
          </div>
        </motion.button>

        <motion.div
          initial={false}
          animate={{
            height: expanded ? "auto" : 0,
            opacity: expanded ? 1 : 0,
          }}
          className="overflow-hidden"
        >
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {paths.map((path, index) => (
              <motion.button
                key={path.region}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: expanded ? 1 : 0, y: expanded ? 0 : 16 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => selectRegion(path.region)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-xl border border-white/10 bg-white/5 p-6 text-left transition hover:border-indigo-400/50 hover:bg-white/10"
              >
                <span className="text-4xl">{path.flag}</span>
                <h3 className="mt-3 text-lg font-semibold text-white">
                  {path.label}
                </h3>
                <p className="mt-1 text-sm text-slate-400">{path.subtitle}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
