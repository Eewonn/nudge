"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useKeyboardShortcuts, type Shortcut } from "@/hooks/useKeyboardShortcuts";
import ShortcutsOverlay from "./ShortcutsOverlay";
import TaskForm from "./TaskForm";

export default function AppShortcuts() {
  const router = useRouter();
  const [showOverlay, setShowOverlay]   = useState(false);
  const [showCapture, setShowCapture]   = useState(false);

  const shortcuts: Shortcut[] = [
    { key: "g d", description: "Go to Dashboard", action: () => router.push("/dashboard") },
    { key: "g t", description: "Go to Tasks",     action: () => router.push("/tasks") },
    { key: "g h", description: "Go to Habits",    action: () => router.push("/habits") },
    { key: "g r", description: "Go to Review",    action: () => router.push("/review") },
    { key: "n",   description: "New task",         action: () => setShowCapture(true) },
    { key: "?",   description: "Show shortcuts",   action: () => setShowOverlay(true) },
  ];

  useKeyboardShortcuts(shortcuts);

  const closeOverlay = useCallback(() => setShowOverlay(false), []);
  const closeCapture = useCallback(() => setShowCapture(false), []);

  return (
    <>
      {showOverlay && <ShortcutsOverlay onClose={closeOverlay} />}
      {showCapture && <TaskForm onClose={closeCapture} />}
    </>
  );
}
