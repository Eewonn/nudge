"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Task, GroupedTasks, TaskGroup } from "@/types";
import { getTaskUrgency } from "@/lib/priority";
import TaskItem from "./TaskItem";
import TaskForm from "./TaskForm";

const SECTIONS: { key: TaskGroup; label: string; emptyText: string }[] = [
  { key: "overdue",  label: "Overdue",  emptyText: "No overdue tasks" },
  { key: "today",    label: "Today",    emptyText: "Nothing due today" },
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalActive} active · {completedTasks.length} completed
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New task
        </button>
      </div>

      {/* Sections */}
      {SECTIONS.map(({ key, label, emptyText }) => {
        const tasks = grouped[key];
        return (
          <section key={key}>
            <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              {label}
              {tasks.length > 0 && (
                <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-gray-600 normal-case tracking-normal font-medium">
                  {tasks.length}
                </span>
              )}
            </h2>

            {tasks.length === 0 ? (
              <p className="text-sm text-gray-400 italic pl-1">{emptyText}</p>
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
            className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showCompleted ? "▾" : "▸"} Completed ({completedTasks.length})
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
