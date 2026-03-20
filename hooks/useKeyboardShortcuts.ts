"use client";

import { useEffect, useRef } from "react";

export interface Shortcut {
  key: string;       // e.g. "n", "?", "g d", "/"
  description: string;
  action: () => void;
}

/**
 * Registers global keyboard shortcuts.
 * Supports single keys and two-key chord sequences (e.g. "g d").
 * Shortcuts are ignored when focus is on an input, textarea, or contenteditable element.
 */
export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const pendingChord = useRef<string | null>(null);
  const chordTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      const editable = (e.target as HTMLElement).isContentEditable;
      if (tag === "INPUT" || tag === "TEXTAREA" || editable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key;

      // If we have a pending chord prefix, check for chord match
      if (pendingChord.current !== null) {
        const chord = `${pendingChord.current} ${key}`;
        const match = shortcuts.find((s) => s.key === chord);
        if (match) {
          e.preventDefault();
          match.action();
        }
        // Clear chord regardless
        pendingChord.current = null;
        if (chordTimer.current) clearTimeout(chordTimer.current);
        return;
      }

      // Check if this key starts a chord (any shortcut starts with this key + space)
      const startsChord = shortcuts.some((s) => s.key.startsWith(key + " "));
      if (startsChord) {
        e.preventDefault();
        pendingChord.current = key;
        // Auto-clear chord after 1.5s
        chordTimer.current = setTimeout(() => { pendingChord.current = null; }, 1500);
        return;
      }

      // Single key match
      const match = shortcuts.find((s) => s.key === key);
      if (match) {
        e.preventDefault();
        match.action();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (chordTimer.current) clearTimeout(chordTimer.current);
    };
  }, [shortcuts]);
}

/** All shortcuts for display in the cheatsheet overlay */
export const SHORTCUT_GROUPS = [
  {
    label: "Navigation",
    items: [
      { key: "g d", description: "Go to Dashboard" },
      { key: "g t", description: "Go to Tasks" },
      { key: "g h", description: "Go to Habits" },
      { key: "g r", description: "Go to Review" },
    ],
  },
  {
    label: "Actions",
    items: [
      { key: "n",   description: "New task / Quick capture" },
      { key: "/",   description: "Focus search (on Tasks page)" },
      { key: "Esc", description: "Close modal / overlay" },
    ],
  },
  {
    label: "Help",
    items: [
      { key: "?", description: "Show this shortcuts panel" },
    ],
  },
] as const;
