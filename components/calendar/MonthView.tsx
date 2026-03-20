"use client";

import type { Event, Task } from "@/types";
import {
  startOfMonth, addDays, isSameDay, isToday,
  eventsForDay, tasksForDay, EVENT_TYPE_COLORS,
} from "./utils";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
  currentDate: Date;
  events: Event[];
  tasks: Task[];
  onSlotClick: (date: string, hour?: number) => void;
  onDayClick: (date: Date) => void;
}

export default function MonthView({ currentDate, events, tasks, onSlotClick, onDayClick }: Props) {
  const monthStart = startOfMonth(currentDate);
  // Start grid on the Sunday before month start
  const gridStart = addDays(monthStart, -monthStart.getDay());

  // Build 6 weeks × 7 days
  const weeks: Date[][] = [];
  let day = new Date(gridStart);
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(day));
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  const currentMonth = currentDate.getMonth();

  return (
    <div className="flex flex-col">
      {/* Day-of-week header — sticky below top bar */}
      <div
        className="grid grid-cols-7 text-center sticky z-10"
        style={{ top: "57px", borderBottom: "1px solid var(--border)", backgroundColor: "var(--bg)" }}
      >
        {DAYS_OF_WEEK.map(d => (
          <div
            key={d}
            className="py-2 text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "var(--text-3)" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div>
        {weeks.map((week, wi) => (
          <div
            key={wi}
            className="grid grid-cols-7"
            style={{ borderBottom: "1px solid var(--border)", minHeight: "96px" }}
          >
            {week.map((day, di) => {
              const inMonth = day.getMonth() === currentMonth;
              const today   = isToday(day);
              const dayEvents = eventsForDay(events, day);
              const dayTasks  = tasksForDay(tasks, day);
              const dateStr   = day.toLocaleDateString("en-CA"); // YYYY-MM-DD

              return (
                <div
                  key={di}
                  onClick={() => onDayClick(day)}
                  className="p-1.5 cursor-pointer transition-colors"
                  style={{
                    borderRight: di < 6 ? "1px solid var(--border)" : "none",
                    backgroundColor: today ? "var(--accent-subtle)" : undefined,
                    opacity: inMonth ? 1 : 0.35,
                  }}
                  onMouseEnter={e => {
                    if (!today) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-2)";
                  }}
                  onMouseLeave={e => {
                    if (!today) (e.currentTarget as HTMLElement).style.backgroundColor = "";
                  }}
                >
                  {/* Date number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${today ? "text-white" : ""}`}
                      style={{
                        backgroundColor: today ? "var(--accent)" : "transparent",
                        color: today ? "#fff" : "var(--text)",
                      }}
                    >
                      {day.getDate()}
                    </span>
                    {(dayEvents.length + dayTasks.length) > 3 && (
                      <span className="text-[9px] font-bold" style={{ color: "var(--text-3)" }}>
                        +{dayEvents.length + dayTasks.length - 2}
                      </span>
                    )}
                  </div>

                  {/* Event / task chips — show up to 2 */}
                  <div className="space-y-0.5">
                    {[
                      ...dayEvents.slice(0, 2).map(e => ({
                        key: `e-${e.id}`,
                        label: e.title,
                        color: EVENT_TYPE_COLORS[e.type] ?? "var(--accent)",
                        onClick: (ev: React.MouseEvent) => { ev.stopPropagation(); onSlotClick(dateStr); },
                      })),
                      ...dayTasks.slice(0, Math.max(0, 2 - dayEvents.length)).map(t => ({
                        key: `t-${t.id}`,
                        label: t.title,
                        color: "var(--imp-" + t.importance + ")",
                        onClick: (ev: React.MouseEvent) => { ev.stopPropagation(); },
                      })),
                    ].map(item => (
                      <div
                        key={item.key}
                        onClick={item.onClick}
                        className="truncate text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                        style={{
                          backgroundColor: item.color + "22",
                          color: item.color,
                          maxWidth: "100%",
                        }}
                      >
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
