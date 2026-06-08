"use client";

import { useMemo } from "react";
import { useLearning } from "@/context/LearningContext";
import type { ErrorCategory, MistakeRecord } from "@/types";

export function useCategoryMistakes(category: ErrorCategory): MistakeRecord[] {
  const { mistakes } = useLearning();

  return useMemo(
    () => mistakes.filter((mistake) => mistake.category === category),
    [mistakes, category],
  );
}
