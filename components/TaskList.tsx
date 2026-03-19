"use client";

import { useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import type { Task, GroupedTasks, TaskGroup } from "@/types";
import { getTaskUrgency } from "@/lib/priority";
import TaskItem from "./TaskItem";
import TaskForm from "./TaskForm";

const SECTIONS: { key: TaskGroup; label: string; emptyText: string; accentStyle?: React.CSSProperties }[] = [
  { key: "overdue",  label: "Overdue",  emptyText: "No overdue tasks",  accentStyle: { color: "var(--danger)" } },
  { key: "today",    label: "Today",    emptyText: "Nothing due today",  accentStyle: { color: "var(--warning)" } },
  { key: "upcoming", label: "Upcoming", emptyText: "Nothing coming up" },
  { key: "someday",  label: "Someday",  emptyText: "No undated tasks" },
];

interface Props {
  grouped: GroupedTasks;
  completedTasks: Task[];
}

export default function TaskList({ grouped, completedTasks }: Props) {
  const [creating, setCreating] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const totalActive = Object.values(grouped).reduce((n, arr) => n + arr.length, 0);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Tasks</h1>
          <p className="text-xs text-text-3 mt-0.5">
            {totalActive} active · {completedTasks.length} completed
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-accent-hover transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New task
        </button>
      </div>

      {/* Sections */}
      {SECTIONS.map(({ key, label, emptyText, accentStyle }) => {
        const tasks = grouped[key];
        return (
          <section key={key}>
            <div className="flex items-center gap-2 mb-2.5">
              <h2
                className="text-[11px] font-semibold uppercase tracking-widest"
                style={tasks.length > 0 && accentStyle ? accentStyle : { color: "var(--text-3)" }}
              >
                {label}
              </h2>
              {tasks.length > 0 && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
                  style={{ background: "var(--surface-2)", color: accentStyle?.color ?? "var(--text-3)" }}
                >
                  {tasks.length}
                </span>
              )}
            </div>

            {tasks.length === 0 ? (
              <p className="text-xs text-text-3 italic pl-0.5">{emptyText}</p>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    urgency={getTaskUrgency(task) ?? key}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}

      {/* Completed */}
      {completedTasks.length > 0 && (
        <section>
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="flex items-center gap-1.5 mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-text-3 hover:text-text-2 transition-colors"
          >
            <ChevronDown
              className={clsx("h-3.5 w-3.5 transition-transform", !showCompleted && "-rotate-90")}
            />
            Completed ({completedTasks.length})
          </button>

          {showCompleted && (
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  urgency={getTaskUrgency(task) ?? "someday"}
                  showUrgencyBadge={false}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {creating && <TaskForm onClose={() => setCreating(false)} />}
    </div>
  );
}
