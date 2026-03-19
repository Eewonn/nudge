"use client";

import { useState, useRef, useCallback } from "react";

// Extend Window for webkit prefix
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}
interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  transcript: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export interface SpeechInputHandle {
  listening: boolean;
  supported: boolean;
  start: (onResult: (text: string) => void) => void;
  stop: () => void;
}

export function useSpeechInput(): SpeechInputHandle {
  const [listening, setListening] = useState(false);
  const recogRef = useRef<SpeechRecognitionInstance | null>(null);

  const supported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const start = useCallback(
    (onResult: (text: string) => void) => {
      if (!supported) return;
      const SR: new () => SpeechRecognitionInstance =
        window.SpeechRecognition ?? window.webkitSpeechRecognition;
      const recog = new SR();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = "en-US";
      recog.onstart  = () => setListening(true);
      recog.onend    = () => setListening(false);
      recog.onerror  = () => setListening(false);
      recog.onresult = (e: SpeechRecognitionEvent) => {
        const results = Array.from({ length: e.results.length }, (_, i) => e.results[i]);
        const text = results.map((r) => r[0].transcript).join(" ").trim();
        if (text) onResult(text);
      };
      recogRef.current = recog;
      recog.start();
    },
    [supported]
  );

  const stop = useCallback(() => {
    recogRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, supported, start, stop };
}
