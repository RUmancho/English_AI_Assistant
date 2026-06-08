"use client";

import { useEffect, useRef } from "react";
import { ERROR_AMBER } from "@/lib/constants";

interface WaveformCompareProps {
  nativeWaveform: number[];
  userWaveform: number[];
  nativeLabel?: string;
  userLabel?: string;
}

function drawWaveform(
  context: CanvasRenderingContext2D,
  data: number[],
  color: string,
  yOffset: number,
  height: number,
) {
  const { width } = context.canvas;
  const step = width / Math.max(data.length, 1);

  context.strokeStyle = color;
  context.lineWidth = 2;
  context.beginPath();

  data.forEach((value, index) => {
    const x = index * step;
    const amplitude = value * (height * 0.4);
    const y = yOffset + height / 2 - amplitude;
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });

  context.stroke();

  context.strokeStyle = `${color}33`;
  context.beginPath();
  data.forEach((value, index) => {
    const x = index * step;
    const amplitude = value * (height * 0.4);
    const y = yOffset + height / 2 + amplitude;
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });
  context.stroke();
}

export function WaveformCompare({
  nativeWaveform,
  userWaveform,
  nativeLabel = "Native Speaker",
  userLabel = "Your Recording",
}: WaveformCompareProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    context.scale(dpr, dpr);

    context.clearRect(0, 0, rect.width, rect.height);

    context.fillStyle = "rgba(30, 41, 59, 0.5)";
    context.fillRect(0, 0, rect.width, rect.height / 2 - 4);
    context.fillRect(0, rect.height / 2 + 4, rect.width, rect.height / 2 - 4);

    if (nativeWaveform.length > 0) {
      drawWaveform(context, nativeWaveform, "#818cf8", 0, rect.height / 2 - 8);
    }

    if (userWaveform.length > 0) {
      drawWaveform(
        context,
        userWaveform,
        ERROR_AMBER,
        rect.height / 2 + 8,
        rect.height / 2 - 8,
      );
    }
  }, [nativeWaveform, userWaveform]);

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
      <div className="mb-3 flex justify-between text-xs">
        <span className="text-indigo-300">{nativeLabel}</span>
        <span className="text-error-amber">{userLabel}</span>
      </div>
      <canvas
        ref={canvasRef}
        className="h-40 w-full rounded-lg"
        style={{ width: "100%", height: "160px" }}
      />
      {userWaveform.length === 0 && (
        <p className="mt-2 text-center text-xs text-slate-500">
          Record yourself to see a comparative waveform
        </p>
      )}
    </div>
  );
}
