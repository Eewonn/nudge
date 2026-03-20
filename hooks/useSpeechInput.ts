"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// Extend Window for webkit prefix
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}
interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
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
  const [supported, setSupported] = useState(false);
  const recogRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    setSupported("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
  }, []);

  const start = useCallback(
    (onResult: (text: string) => void) => {
      if (!supported) return;
      const SR: new () => SpeechRecognitionInstance =
        window.SpeechRecognition ?? window.webkitSpeechRecognition;
      const recog = new SR();
      recog.continuous = true;
      recog.interimResults = false;
      recog.lang = "en-US";
      let accumulated = "";
      recog.onstart  = () => setListening(true);
      recog.onend    = () => {
        setListening(false);
        const text = accumulated.trim();
        if (text) onResult(text);
      };
      recog.onerror  = () => setListening(false);
      recog.onresult = (e: SpeechRecognitionEvent) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            accumulated += e.results[i][0].transcript + " ";
          }
        }
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
