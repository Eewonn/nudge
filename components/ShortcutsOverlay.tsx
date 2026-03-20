"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { SHORTCUT_GROUPS } from "@/hooks/useKeyboardShortcuts";

interface Props {
  onClose: () => void;
}

export default function ShortcutsOverlay({ onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "?") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: "rgba(15,23,48,0.55)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: "var(--bg)", boxShadow: "0 24px 64px rgba(15,23,48,0.18)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--text-3)" }}>
              Keyboard
            </p>
            <h2 className="text-base font-extrabold font-headline" style={{ color: "var(--text)" }}>
              Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors"
            style={{ color: "var(--text-3)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-2)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Shortcut groups */}
        <div className="px-6 py-5 space-y-6">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-3)" }}>
                {group.label}
              </p>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-4">
                    <span className="text-sm" style={{ color: "var(--text-2)" }}>
                      {item.description}
                    </span>
                    <kbd
                      className="text-[11px] font-bold px-2 py-1 rounded-md shrink-0 tabular-nums"
                      style={{
                        backgroundColor: "var(--surface-3)",
                        color: "var(--text-2)",
                        border: "1px solid var(--border-strong)",
                        fontFamily: "monospace",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="px-6 pb-5">
          <p className="text-xs text-center" style={{ color: "var(--text-3)" }}>
            Press <kbd
              className="text-[10px] font-bold px-1.5 py-0.5 rounded mx-0.5"
              style={{ backgroundColor: "var(--surface-3)", border: "1px solid var(--border-strong)", fontFamily: "monospace" }}
            >Esc</kbd> or <kbd
              className="text-[10px] font-bold px-1.5 py-0.5 rounded mx-0.5"
              style={{ backgroundColor: "var(--surface-3)", border: "1px solid var(--border-strong)", fontFamily: "monospace" }}
            >?</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}
