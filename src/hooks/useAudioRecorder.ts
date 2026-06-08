"use client";

import { useCallback, useRef, useState } from "react";

interface UseAudioRecorderReturn {
  isRecording: boolean;
  audioUrl: string | null;
  waveform: number[];
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearRecording: () => void;
}

function extractWaveform(audioBuffer: AudioBuffer, samples = 120): number[] {
  const channel = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(channel.length / samples);
  const waveform: number[] = [];

  for (let index = 0; index < samples; index++) {
    const start = index * blockSize;
    let sum = 0;
    for (let offset = 0; offset < blockSize; offset++) {
      sum += Math.abs(channel[start + offset] ?? 0);
    }
    waveform.push(sum / blockSize);
  }

  const peak = Math.max(...waveform, 0.001);
  return waveform.map((value) => value / peak);
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const clearRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setWaveform([]);
    setError(null);
  }, [audioUrl]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      clearRecording();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        try {
          const arrayBuffer = await blob.arrayBuffer();
          const audioContext = new AudioContext();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          setWaveform(extractWaveform(audioBuffer));
          await audioContext.close();
        } catch (decodeError) {
          console.error("Waveform decode error:", decodeError);
        }

        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (recordError) {
      console.error("Recording error:", recordError);
      setError("Microphone access denied or unavailable.");
    }
  }, [clearRecording]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  return {
    isRecording,
    audioUrl,
    waveform,
    error,
    startRecording,
    stopRecording,
    clearRecording,
  };
}
