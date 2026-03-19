"use client";

import { useState, useTransition } from "react";
import { Pencil, Archive, ArchiveRestore } from "lucide-react";
import { clsx } from "clsx";
import { toggleHabitLog, archiveHabit } from "@/app/actions/habits";
import type { Habit, HabitLog } from "@/types";
import HabitForm from "./HabitForm";

interface Props {
  habit: Habit;
  logs: HabitLog[]; // logs for this habit (last 7 days)
}

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

function computeStreak(logs: HabitLog[]): number {
  const doneSet = new Set(logs.map((l) => l.date));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    if (doneSet.has(ds)) streak++;
    else break;
  }
  return streak;
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function HabitItem({ habit, logs }: Props) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  const days = getLast7Days();
  const doneSet = new Set(logs.map((l) => l.date));
  const streak = computeStreak(logs);
  const today = new Date().toISOString().slice(0, 10);

  function handleToggle(date: string) {
    startTransition(() => toggleHabitLog(habit.id, date, !doneSet.has(date)));
  }

  function handleArchive() {
    startTransition(() => archiveHabit(habit.id, !habit.is_active));
  }

  return (
    <>
      <div
        className={clsx(
          "group flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-colors",
          habit.is_active
            ? "border-border bg-surface hover:border-border-strong"
            : "border-border bg-surface opacity-50",
          pending && "opacity-40 pointer-events-none"
        )}
      >
        {/* Name + streak */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text truncate">{habit.name}</span>
            {streak > 0 && (
              <span className="text-[11px] font-semibold text-accent tabular-nums shrink-0">
                {streak}d
              </span>
            )}
          </div>
          <p className="text-[11px] text-text-3 mt-0.5">
            {habit.target_frequency === 7 ? "Daily" : `${habit.target_frequency}× / week`}
          </p>
        </div>

        {/* 7-day grid */}
        <div className="flex items-center gap-1 shrink-0">
          {days.map((date, i) => {
            const done = doneSet.has(date);
            const isToday = date === today;
            return (
              <div key={date} className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-text-3 uppercase">
                  {DAY_LABELS[new Date(date + "T12:00:00").getDay()]}
                </span>
                <button
                  onClick={() => isToday || done ? handleToggle(date) : undefined}
                  disabled={!isToday && !done}
                  title={date}
                  className={clsx(
                    "h-6 w-6 rounded-md border transition-all",
                    done
                      ? "border-accent bg-accent"
                      : isToday
                      ? "border-border-strong bg-surface-2 hover:border-accent hover:bg-accent-subtle"
                      : "border-border bg-surface-2 cursor-default opacity-50"
                  )}
                />
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {habit.is_active && (
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg p-1.5 text-text-3 hover:bg-surface-2 hover:text-text transition-colors"
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={handleArchive}
            className="rounded-lg p-1.5 text-text-3 hover:bg-surface-2 hover:text-text transition-colors"
            title={habit.is_active ? "Archive" : "Restore"}
          >
            {habit.is_active
              ? <Archive className="h-3.5 w-3.5" />
              : <ArchiveRestore className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {editing && <HabitForm habit={habit} onClose={() => setEditing(false)} />}
    </>
  );
}
