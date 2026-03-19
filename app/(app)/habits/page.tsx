"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus } from "lucide-react";
import { getHabits, getHabitLogs } from "@/app/actions/habits";
import type { Habit, HabitLog } from "@/types";
import HabitItem from "@/components/HabitItem";
import HabitForm from "@/components/HabitForm";

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [creating, setCreating] = useState(false);
  const [, startTransition] = useTransition();

  function load() {
    startTransition(async () => {
      const [h, l] = await Promise.all([getHabits(), getHabitLogs(7)]);
      setHabits(h);
      setLogs(l);
    });
  }

  useEffect(() => { load(); }, []);

  const active   = habits.filter((h) => h.is_active);
  const archived = habits.filter((h) => !h.is_active);

  function logsFor(habit: Habit) {
    return logs.filter((l) => l.habit_id === habit.id);
  }

  return (
    <div className="mx-auto max-w-2xl p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Habits</h1>
          <p className="text-xs text-text-3 mt-0.5">
            {active.length} active · track your consistency
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-accent-hover transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New habit
        </button>
      </div>

      {/* Active habits */}
      <section className="space-y-2">
        {active.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-sm text-text-3">No habits yet — add one to start tracking.</p>
          </div>
        ) : (
          active.map((habit) => (
            <HabitItem key={habit.id} habit={habit} logs={logsFor(habit)} />
          ))
        )}
      </section>

      {/* Archived */}
      {archived.length > 0 && (
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-text-3 mb-2.5">
            Archived
          </p>
          <div className="space-y-2">
            {archived.map((habit) => (
              <HabitItem key={habit.id} habit={habit} logs={logsFor(habit)} />
            ))}
          </div>
        </section>
      )}

      {creating && (
        <HabitForm
          onClose={() => {
            setCreating(false);
            load();
          }}
        />
      )}
    </div>
  );
}
