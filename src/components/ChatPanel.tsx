"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FormalitySlider } from "@/components/FormalitySlider";
import { FormalityWarning } from "@/components/FormalityWarning";
import { LEVELS } from "@/lib/constants";
import {
  buildFormalityWarning,
  checkFormalityViolation,
} from "@/lib/formality";
import { parseTutorMetadata } from "@/lib/metadata";
import { useLearning } from "@/context/LearningContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { MessageBubble } from "@/components/MessageBubble";
import { MicrophoneButton } from "@/components/MicrophoneButton";

export function ChatPanel() {
  const {
    messages,
    activeLevelId,
    region,
    vocabulary,
    communicationMode,
    formalityLevel,
    addMessage,
    applyTutorMetadata,
    getMasteredRuleIds,
    setCommunicationMode,
    setFormalityLevel,
    setScreen,
  } = useLearning();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [formalityAlert, setFormalityAlert] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formalityDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const speechLang = region === "GB" ? "en-GB" : "en-US";
  const {
    isListening,
    isSupported,
    transcript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition(speechLang);

  const level = LEVELS.find((item) => item.id === activeLevelId);

  const showFormalityWarning = useCallback((message: string) => {
    setFormalityAlert(message);
    if (formalityDismissRef.current) {
      clearTimeout(formalityDismissRef.current);
    }
    formalityDismissRef.current = setTimeout(() => {
      setFormalityAlert(null);
    }, 6000);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isListening) {
      setCommunicationMode("audio");
    }
  }, [isListening, setCommunicationMode]);

  useEffect(() => {
    return () => {
      if (formalityDismissRef.current) {
        clearTimeout(formalityDismissRef.current);
      }
    };
  }, []);

  const evaluateFormality = useCallback(
    (
      userText: string,
      metadata: {
        formalityMet?: boolean;
        formalityWarning?: string;
        detectedFormalityLevel?: number;
      } | null,
    ) => {
      if (metadata?.formalityMet === false) {
        showFormalityWarning(
          buildFormalityWarning(
            formalityLevel,
            metadata.detectedFormalityLevel ?? 5,
            metadata.formalityWarning,
          ),
        );
        return;
      }

      if (metadata?.formalityMet === true) {
        return;
      }

      const heuristic = checkFormalityViolation(userText, formalityLevel);
      if (heuristic.violated) {
        showFormalityWarning(heuristic.message);
      }
    },
    [formalityLevel, showFormalityWarning],
  );

  const sendMessage = useCallback(
    async (content: string, mode: "text" | "audio") => {
      if (!content.trim() || !level || isLoading) {
        return;
      }

      setApiError(null);
      setIsLoading(true);

      const trimmed = content.trim();
      const userMessage = addMessage({
        role: "user",
        content: trimmed,
        mode,
      });

      const history = [...messages, userMessage].map((message) => ({
        role: message.role as "user" | "assistant",
        content: message.content,
      }));

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            level,
            vocabulary,
            mode,
            masteredRuleIds: getMasteredRuleIds(),
            formalityLevel,
          }),
        });

        const data = (await response.json()) as {
          content?: string;
          error?: string;
        };

        if (!response.ok || data.error) {
          throw new Error(data.error ?? "Failed to get AI response.");
        }

        const { displayContent, metadata } = parseTutorMetadata(
          data.content ?? "",
        );

        addMessage({
          role: "assistant",
          content: displayContent,
          mode: "text",
        });

        evaluateFormality(trimmed, metadata);

        if (metadata && activeLevelId) {
          applyTutorMetadata(metadata, activeLevelId, trimmed, mode);
        }
      } catch (error) {
        console.error("Chat error:", error);
        setApiError(
          error instanceof Error ? error.message : "Something went wrong.",
        );
      } finally {
        setIsLoading(false);
        setInput("");
        resetTranscript();
      }
    },
    [
      level,
      isLoading,
      messages,
      vocabulary,
      formalityLevel,
      addMessage,
      applyTutorMetadata,
      getMasteredRuleIds,
      activeLevelId,
      resetTranscript,
      evaluateFormality,
    ],
  );

  const handleSendText = () => {
    setCommunicationMode("text");
    void sendMessage(input, "text");
  };

  const handleStopAudio = async () => {
    stopListening();
    if (transcript.trim()) {
      await sendMessage(transcript, "audio");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendText();
    }
  };

  if (!level) {
    return null;
  }

  return (
    <div className="flex h-full flex-col bg-slate-950">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setScreen("roadmap")}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="font-semibold text-white">{level.name}</h1>
            <p className="text-xs text-slate-400">
              {communicationMode === "audio" ? "Audio Mode" : "Text Mode"} ·
              Global Evaluation Arena
            </p>
          </div>
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-800/80 p-1 text-xs">
          <button
            type="button"
            onClick={() => setCommunicationMode("text")}
            className={`rounded-md px-3 py-1.5 transition ${
              communicationMode === "text"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Text
          </button>
          <button
            type="button"
            onClick={() => setCommunicationMode("audio")}
            className={`rounded-md px-3 py-1.5 transition ${
              communicationMode === "audio"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Audio
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-auto mt-12 max-w-md text-center"
          >
            <p className="text-lg font-medium text-white">
              Welcome to your AI tutor!
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Set your formality slider below, then chat or use the microphone to
              practice in {level.name}.
            </p>
          </motion.div>
        )}

        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Tutor is thinking...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {(apiError || speechError) && (
        <div className="mx-4 mb-2 rounded-lg border border-error-amber/30 bg-error-amber/10 px-4 py-2 text-sm text-error-amber md:mx-6">
          {apiError ?? speechError}
        </div>
      )}

      {isListening && transcript && (
        <div className="mx-4 mb-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-200 md:mx-6">
          <span className="text-xs uppercase text-indigo-400">Listening: </span>
          {transcript}
        </div>
      )}

      <div className="border-t border-white/10 px-4 pb-4 pt-3 md:px-6 md:pb-6">
        <div className="mx-auto max-w-3xl space-y-3">
          <FormalityWarning
            message={formalityAlert}
            onDismiss={() => setFormalityAlert(null)}
          />

          <FormalitySlider
            value={formalityLevel}
            onChange={setFormalityLevel}
            disabled={isLoading}
          />

          <div className="flex items-end gap-2">
            <MicrophoneButton
              isListening={isListening}
              isSupported={isSupported}
              onStart={startListening}
              onStop={() => void handleStopAudio()}
            />
            <textarea
              value={isListening ? transcript : input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isListening || isLoading}
              placeholder={
                communicationMode === "audio"
                  ? "Tap mic to speak, or type here..."
                  : "Type your message..."
              }
              rows={1}
              className="max-h-32 min-h-[48px] flex-1 resize-none rounded-xl border border-white/10 bg-slate-800/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
            />
            <motion.button
              type="button"
              onClick={handleSendText}
              disabled={isLoading || !input.trim() || isListening}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
