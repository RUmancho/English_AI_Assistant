"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Dashboard } from "@/components/Dashboard";
import { FlagSelection } from "@/components/FlagSelection";
import { GrammarPage } from "@/components/learning/GrammarPage";
import { PronunciationPage } from "@/components/learning/PronunciationPage";
import { StructurePage } from "@/components/learning/StructurePage";
import { VocabularyPage } from "@/components/learning/VocabularyPage";
import { Roadmap } from "@/components/Roadmap";
import { useLearning } from "@/context/LearningContext";

export function AppShell() {
  const { screen } = useLearning();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen"
      >
        {screen === "flag" && <FlagSelection />}
        {screen === "roadmap" && <Roadmap />}
        {screen === "dashboard" && <Dashboard />}
        {screen === "grammar" && <GrammarPage />}
        {screen === "pronunciation" && <PronunciationPage />}
        {screen === "vocabulary" && <VocabularyPage />}
        {screen === "structure" && <StructurePage />}
      </motion.div>
    </AnimatePresence>
  );
}
