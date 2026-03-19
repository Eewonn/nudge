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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: "var(--text-3)" }}>
            Task Ledger
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>Blueprints</h1>
          <p className="text-xs mt-1.5" style={{ color: "var(--text-3)" }}>
            {totalActive} active · {completedTasks.length} completed
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="sovereign-gradient flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 active:scale-95"
          style={{ boxShadow: "0 4px 14px rgba(26,64,194,0.3)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 20px rgba(26,64,194,0.4)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(26,64,194,0.3)"; }}
        >
          <Plus className="h-4 w-4" />
          New Blueprint
        </button>
      </div>

      {/* Sections */}
      {SECTIONS.map(({ key, label, emptyText, accentStyle }) => {
        const tasks = grouped[key];
        return (
          <section key={key}>
            {/* Section header with divider */}
            <div className="flex items-center gap-3 mb-4">
              <h2
                className="text-[10px] font-bold uppercase tracking-[0.18em] shrink-0"
                style={tasks.length > 0 && accentStyle ? accentStyle : { color: "var(--text-3)" }}
              >
                {label}
              </h2>
              {tasks.length > 0 && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums shrink-0"
                  style={{
                    backgroundColor: accentStyle?.color
                      ? `${(accentStyle.color as string).replace("var(--", "").replace(")", "")}` === "danger"
                        ? "var(--danger-subtle)" : "var(--surface-2)"
                      : "var(--surface-2)",
                    color: accentStyle?.color ?? "var(--text-3)",
                  }}
                >
                  {tasks.length}
                </span>
              )}
              <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
            </div>

            {tasks.length === 0 ? (
              <p className="text-xs italic pl-0.5" style={{ color: "var(--text-3)" }}>{emptyText}</p>
            ) : (
              <div className="space-y-2.5">
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
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setShowCompleted((v) => !v)}
              className="flex items-center gap-2 shrink-0 transition-colors"
              style={{ color: "var(--text-3)" }}
            >
              <ChevronDown
                className={clsx("h-3.5 w-3.5 transition-transform duration-200", !showCompleted && "-rotate-90")}
              />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
                Completed ({completedTasks.length})
              </span>
            </button>
            <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
          </div>

          {showCompleted && (
            <div className="space-y-2.5">
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
