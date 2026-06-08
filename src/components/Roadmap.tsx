"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Lock, Star, Unlock } from "lucide-react";
import { UNLOCK_THRESHOLD } from "@/lib/constants";
import { useLearning } from "@/context/LearningContext";
import type { LevelDefinition } from "@/types";

export function Roadmap() {
  const {
    region,
    proficiency,
    isLevelAccessible,
    selectLevel,
    setScreen,
    getLevelsForRegion,
  } = useLearning();

  if (!region) {
    return null;
  }

  const levels = getLevelsForRegion(region);
  const foundational = levels.find((level) => level.isFoundational);
  const dialects = levels.filter((level) => !level.isFoundational);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 px-4 py-8">
      <div className="mx-auto max-w-lg">
        <button
          type="button"
          onClick={() => setScreen("flag")}
          className="mb-6 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Change language path
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-sm uppercase tracking-widest text-indigo-300">
            {region === "US" ? "American English" : "British English"}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-white">Learning Roadmap</h1>
          <p className="mt-2 text-slate-400">
            Master rules in Grammar & Structure chains, then prove fluency in the
            main chat. Dialects unlock at {UNLOCK_THRESHOLD}% global chat
            proficiency.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-indigo-400/50 to-slate-700" />

          {foundational && (
            <RoadmapNode
              level={foundational}
              unlocked
              proficiency={proficiency}
              isActive
              onSelect={() => selectLevel(foundational.id)}
            />
          )}

          {dialects.map((level, index) => {
            const unlocked = isLevelAccessible(level.id);
            return (
              <RoadmapNode
                key={level.id}
                level={level}
                unlocked={unlocked}
                proficiency={unlocked ? proficiency : 0}
                isActive={false}
                delay={0.15 * (index + 1)}
                onSelect={() => unlocked && selectLevel(level.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface RoadmapNodeProps {
  level: LevelDefinition;
  unlocked: boolean;
  proficiency: number;
  isActive: boolean;
  delay?: number;
  onSelect: () => void;
}

function RoadmapNode({
  level,
  unlocked,
  proficiency,
  isActive,
  delay = 0,
  onSelect,
}: RoadmapNodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="relative mb-8 pl-16"
    >
      <div
        className={`absolute left-3.5 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
          unlocked
            ? "border-indigo-400 bg-indigo-500"
            : "border-slate-600 bg-slate-800"
        }`}
      >
        {unlocked ? (
          isActive ? (
            <Star className="h-3 w-3 text-white" />
          ) : (
            <Unlock className="h-3 w-3 text-white" />
          )
        ) : (
          <Lock className="h-3 w-3 text-slate-500" />
        )}
      </div>

      <button
        type="button"
        onClick={onSelect}
        disabled={!unlocked}
        className={`w-full rounded-xl border p-5 text-left transition ${
          unlocked
            ? "border-white/10 bg-white/5 hover:border-indigo-400/50 hover:bg-white/10"
            : "cursor-not-allowed border-slate-800 bg-slate-900/50 opacity-60"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-indigo-300">
              {level.isFoundational ? "Foundational" : "Dialect"}
            </p>
            <h3 className="mt-1 font-semibold text-white">{level.name}</h3>
            <p className="mt-1 text-sm text-slate-400">{level.description}</p>
          </div>
          {!unlocked && (
            <span className="shrink-0 rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-400">
              {UNLOCK_THRESHOLD}% to unlock
            </span>
          )}
        </div>

        {level.isFoundational && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-slate-400">
              <span>Proficiency</span>
              <span>{proficiency}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${proficiency}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Driven by main chat: fewer mistakes, natural contractions
              (wanna, gonna, kinda), and speaking accuracy
            </p>
          </div>
        )}
      </button>
    </motion.div>
  );
}
