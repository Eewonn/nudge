"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import DayView from "./DayView";
import QuickCreateModal from "./QuickCreateModal";
import { startOfWeek, addDays, addMonths, weekRangeLabel } from "./utils";
import type { Event, Task } from "@/types";

type ViewType = "month" | "week" | "day";

interface Props {
  events: Event[];
  tasks: Task[];
}

export default function CalendarClient({ events: initial, tasks }: Props) {
  const [view, setView]               = useState<ViewType>("week");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [localEvents, setLocalEvents] = useState<Event[]>(initial);
  const [localTasks, setLocalTasks]   = useState<Task[]>(tasks);
  const [createSlot, setCreateSlot]   = useState<{ date: string; hour?: number } | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // ── Navigation ─────────────────────────────────────────────────────────────

  function navigate(delta: number) {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (view === "month") {
        d.setMonth(d.getMonth() + delta);
      } else if (view === "week") {
        d.setDate(d.getDate() + delta * 7);
      } else {
        d.setDate(d.getDate() + delta);
      }
      return d;
    });
  }

  function goToday() { setCurrentDate(new Date()); }

  // ── Header title ───────────────────────────────────────────────────────────

  function headerTitle(): string {
    if (view === "month") {
      return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    if (view === "week") {
      return weekRangeLabel(startOfWeek(currentDate));
    }
    return currentDate.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });
  }

  // ── Quick create callbacks ─────────────────────────────────────────────────

  function handleSlotClick(date: string, hour?: number) {
    setCreateSlot({ date, hour });
  }

  function handleDayClick(day: Date) {
    setCurrentDate(day);
    setView("day");
  }

  function handleEventCreated(event: Event) {
    setLocalEvents(prev => [...prev, event]);
    setCreateSlot(null);
  }

  function handleTaskCreated(task: Task) {
    setLocalTasks(prev => [...prev, task]);
    setCreateSlot(null);
  }

  function handleEventUpdated(event: Event) {
    setLocalEvents(prev => prev.map(e => e.id === event.id ? event : e));
    setEditingEvent(null);
  }

  function handleEventDeleted(id: string) {
    setLocalEvents(prev => prev.filter(e => e.id !== id));
    setEditingEvent(null);
  }

  // ── Shared view props ──────────────────────────────────────────────────────

  const weekStart = startOfWeek(currentDate);
  const today = new Date().toLocaleDateString("en-CA");

  return (
    <div className="flex flex-col">
      {/* ── Top bar — sticky so it stays visible while scrolling ── */}
      <div
        className="sticky top-0 z-20 flex items-center gap-3 px-4 md:px-6 py-3 flex-wrap gap-y-2"
        style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--bg)" }}
      >
        {/* Navigate */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg transition-colors hover:bg-[var(--surface-2)]"
            style={{ color: "var(--text-2)" }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToday}
            className="px-3 py-1 rounded-lg text-xs font-bold transition-colors hover:bg-[var(--surface-2)]"
            style={{ color: "var(--text-2)", border: "1px solid var(--border)" }}
          >
            Today
          </button>
          <button
            onClick={() => navigate(1)}
            className="p-1.5 rounded-lg transition-colors hover:bg-[var(--surface-2)]"
            style={{ color: "var(--text-2)" }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <h2 className="text-base font-bold flex-1 min-w-0 truncate" style={{ color: "var(--text)" }}>
          {headerTitle()}
        </h2>

        {/* View switcher */}
        <div className="flex gap-0.5 p-1 rounded-xl" style={{ backgroundColor: "var(--surface-2)" }}>
          {(["month", "week", "day"] as ViewType[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all"
              style={{
                backgroundColor: view === v ? "var(--surface)" : "transparent",
                color: view === v ? "var(--accent)" : "var(--text-3)",
                boxShadow: view === v ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {v}
            </button>
          ))}
        </div>

        {/* New event */}
        <button
          onClick={() => setCreateSlot({ date: today })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
          style={{ backgroundColor: "var(--accent)", color: "var(--accent-fg)" }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New</span>
        </button>
      </div>

      {/* ── View ── */}
      <div>
        {view === "month" && (
          <MonthView
            currentDate={currentDate}
            events={localEvents}
            tasks={localTasks}
            onSlotClick={handleSlotClick}
            onDayClick={handleDayClick}
          />
        )}
        {view === "week" && (
          <WeekView
            weekStart={weekStart}
            events={localEvents}
            tasks={localTasks}
            onSlotClick={handleSlotClick}
            onEventClick={setEditingEvent}
          />
        )}
        {view === "day" && (
          <DayView
            currentDate={currentDate}
            events={localEvents}
            tasks={localTasks}
            onSlotClick={handleSlotClick}
            onEventClick={setEditingEvent}
          />
        )}
      </div>

      {/* ── Quick create modal ── */}
      {createSlot && (
        <QuickCreateModal
          slot={createSlot}
          onClose={() => setCreateSlot(null)}
          onEventCreated={handleEventCreated}
          onTaskCreated={handleTaskCreated}
        />
      )}

      {/* ── Edit event modal ── */}
      {editingEvent && (
        <QuickCreateModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onEventCreated={handleEventCreated}
          onTaskCreated={handleTaskCreated}
          onEventUpdated={handleEventUpdated}
          onEventDeleted={handleEventDeleted}
        />
      )}
    </div>
  );
}
