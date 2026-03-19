"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";
import { createHabit, updateHabit, type HabitInput } from "@/app/actions/habits";
import type { Habit } from "@/types";

const FREQ_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

interface Props {
  habit?: Habit;
  onClose: () => void;
}

export default function HabitForm({ habit, onClose }: Props) {
  const [name, setName] = useState(habit?.name ?? "");
  const [frequency, setFrequency] = useState(habit?.target_frequency ?? 7);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required."); return; }
    setError(null);
    const input: HabitInput = { name: name.trim(), target_frequency: frequency };
    startTransition(async () => {
      try {
        if (habit) await updateHabit(habit.id, input);
        else await createHabit(input);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  const freqLabel = (f: number) =>
    f === 7 ? "Every day" : f === 1 ? "Once a week" : `${f}× per week`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl bg-surface border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-sm font-semibold text-text">
            {habit ? "Edit habit" : "New habit"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-3 hover:bg-surface-2 hover:text-text transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <p className="text-sm text-danger bg-danger-subtle border border-[var(--danger-border)] rounded-xl px-3.5 py-2.5">
              {error}
            </p>
          )}

          <div>
            <label className="block text-xs font-medium text-text-2 uppercase tracking-wider mb-1.5">
              Habit name
            </label>
            <input
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Read for 20 minutes"
              className="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none placeholder:text-text-3 focus:border-accent focus:ring-2 focus:ring-[var(--accent)]/15 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-2 uppercase tracking-wider mb-2">
              Frequency
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {FREQ_OPTIONS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className="flex-1 min-w-[2.5rem] rounded-xl border py-2 text-xs font-medium transition-all"
                  style={
                    frequency === f
                      ? { borderColor: "var(--accent)", backgroundColor: "var(--accent-subtle)", color: "var(--accent)" }
                      : { borderColor: "var(--border)", color: "var(--text-3)" }
                  }
                >
                  {f}×
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-text-3">{freqLabel(frequency)}</p>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-2 hover:bg-surface-2 hover:text-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
            >
              {pending ? "Saving…" : habit ? "Save changes" : "Create habit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
