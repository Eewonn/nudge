"use client";

import { useEffect } from "react";

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  danger = true,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: "rgba(15,23,48,0.55)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-2xl p-8 space-y-4"
        style={{
          backgroundColor: "var(--bg)",
          border: "1px solid var(--border)",
          boxShadow: "0 24px 64px rgba(15,23,48,0.18)",
        }}
      >
        <div>
          <h2 className="text-base font-bold" style={{ color: "var(--text)" }}>{title}</h2>
          <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "var(--text-2)" }}>{message}</p>
        </div>
        <div className="flex gap-3 justify-end pt-1">
          <button
            onClick={onCancel}
            className="rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors"
            style={{ borderColor: "var(--border-strong)", color: "var(--text-2)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-2)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all active:scale-95"
            style={{ backgroundColor: danger ? "var(--imp-high)" : "var(--accent)" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
