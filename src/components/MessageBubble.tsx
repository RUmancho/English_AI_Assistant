"use client";

import { motion } from "framer-motion";
import { Mic, User } from "lucide-react";
import type { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-indigo-600" : "bg-slate-700"
        }`}
      >
        {isUser ? (
          message.mode === "audio" ? (
            <Mic className="h-4 w-4 text-white" />
          ) : (
            <User className="h-4 w-4 text-white" />
          )
        ) : (
          <span className="text-xs font-bold text-white">AI</span>
        )}
      </div>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-indigo-600 text-white"
            : "border border-white/10 bg-white/5 text-slate-200"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.mode === "audio" && isUser && (
          <p className="mt-1 text-xs text-indigo-200">via Audio Mode</p>
        )}
      </div>
    </motion.div>
  );
}
