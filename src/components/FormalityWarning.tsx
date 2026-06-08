"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface FormalityWarningProps {
  message: string | null;
  onDismiss: () => void;
}

export function FormalityWarning({ message, onDismiss }: FormalityWarningProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          className="mx-auto mb-2 flex max-w-3xl items-start gap-3 rounded-xl border border-error-amber/40 bg-error-amber/10 px-4 py-3 shadow-lg shadow-error-amber/5"
          role="alert"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error-amber" />
          <p className="flex-1 text-sm text-error-amber">{message}</p>
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded p-0.5 text-error-amber/70 transition hover:bg-error-amber/10 hover:text-error-amber"
            aria-label="Dismiss formality warning"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
