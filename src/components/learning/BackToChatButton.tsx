"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useLearning } from "@/context/LearningContext";

export function BackToChatButton() {
  const { backToDashboard } = useLearning();

  return (
    <motion.button
      type="button"
      onClick={backToDashboard}
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-indigo-400/40 hover:bg-white/10 hover:text-white"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Tutor Chat
    </motion.button>
  );
}
