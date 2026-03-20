"use client";

import { useRef, useEffect } from "react";
import type { Event, Task } from "@/types";
import {
  addDays, isSameDay, isToday,
  eventsForDay, tasksForDay,
  topPx, heightPx, layoutDayEvents,
  EVENT_TYPE_COLORS, EVENT_TYPE_BG,
  formatTime,
  HOUR_HEIGHT, GRID_START, GRID_END,
} from "./utils";

const HOURS = Array.from({ length: GRID_END - GRID_START }, (_, i) => GRID_START + i);
const DAYS  = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const LEFT_GUTTER = 52; // px

interface Props {
  weekStart: Date;
  events: Event[];
  tasks: Task[];
  onSlotClick: (date: string, hour: number) => void;
  onEventClick?: (event: Event) => void;
}

export default function WeekView({ weekStart, events, tasks, onSlotClick, onEventClick }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollToHour = Math.max(0, new Date().getHours() - 2);
      scrollRef.current.scrollTop = scrollToHour * HOUR_HEIGHT;
    }
  }, []);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="flex flex-col">
      {/* Day header row — sticky below the top bar */}
      <div
        className="flex shrink-0 sticky z-10"
        style={{
          top: "57px", // height of CalendarClient top bar
          borderBottom: "1px solid var(--border)",
          paddingLeft: `${LEFT_GUTTER}px`,
          backgroundColor: "var(--bg)",
        }}
      >
        {days.map((day, i) => {
          const today = isToday(day);
          return (
            <div
              key={i}
              className="flex-1 py-2 text-center"
              style={{ borderLeft: "1px solid var(--border)" }}
            >
              <div
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: today ? "var(--accent)" : "var(--text-3)" }}
              >
                {DAYS[day.getDay()]}
              </div>
              <div
                className={`text-sm font-bold mx-auto mt-0.5 w-7 h-7 flex items-center justify-center rounded-full`}
                style={{
                  backgroundColor: today ? "var(--accent)" : "transparent",
                  color: today ? "#fff" : "var(--text)",
                }}
              >
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* All-day strip */}
      <AllDayStrip days={days} events={events} />

      {/* Time grid — scrollable container */}
      <div ref={scrollRef} className="overflow-auto" style={{ height: "calc(100vh - 160px)" }}>
        <div
          className="relative flex"
          style={{ minWidth: "600px", height: `${HOURS.length * HOUR_HEIGHT}px` }}
        >
          {/* Hour labels */}
          <div
            className="shrink-0 relative"
            style={{ width: `${LEFT_GUTTER}px` }}
          >
            {HOURS.map(h => (
              <div
                key={h}
                className="absolute right-2 text-[10px] font-semibold"
                style={{
                  top: `${(h - GRID_START) * HOUR_HEIGHT - 7}px`,
                  color: "var(--text-3)",
                }}
              >
                {h === 12 ? "12pm" : h < 12 ? `${h}am` : `${h - 12}pm`}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, di) => {
            const dayEvents = eventsForDay(events, day).filter(e => !e.is_all_day);
            const dayTasks  = tasksForDay(tasks, day);
            const laid      = layoutDayEvents(dayEvents);
            const dateStr   = day.toLocaleDateString("en-CA");
            const today     = isToday(day);

            return (
              <div
                key={di}
                className="flex-1 relative"
                style={{
                  borderLeft: "1px solid var(--border)",
                  backgroundColor: today ? "var(--accent-subtle)" : undefined,
                }}
              >
                {/* Hour grid lines + click targets */}
                {HOURS.map(h => (
                  <div
                    key={h}
                    className="absolute w-full cursor-pointer transition-colors"
                    style={{
                      top: `${(h - GRID_START) * HOUR_HEIGHT}px`,
                      height: `${HOUR_HEIGHT}px`,
                      borderTop: "1px solid var(--border)",
                    }}
                    onClick={() => onSlotClick(dateStr, h)}
                  />
                ))}

                {/* Events */}
                {laid.map(ev => {
                  const start     = new Date(ev.start_at);
                  const end       = ev.end_at ? new Date(ev.end_at) : null;
                  const top       = topPx(start);
                  const height    = heightPx(start, end);
                  const colW      = 100 / ev.numCols;
                  const color     = EVENT_TYPE_COLORS[ev.type] ?? "var(--accent)";
                  const bg        = EVENT_TYPE_BG[ev.type] ?? "rgba(26,64,194,0.15)";

                  if (top + height < 0 || top > HOURS.length * HOUR_HEIGHT) return null;

                  return (
                    <div
                      key={ev.id}
                      className="absolute rounded-lg px-1.5 py-1 overflow-hidden cursor-pointer"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        left: `${ev.col * colW + 1}%`,
                        width: `${colW - 2}%`,
                        backgroundColor: bg,
                        borderLeft: `3px solid ${color}`,
                        zIndex: 1,
                      }}
                      title={`${ev.title} · ${formatTime(ev.start_at)}${ev.end_at ? ` – ${formatTime(ev.end_at)}` : ""}`}
                      onClick={(e) => { e.stopPropagation(); onEventClick?.(ev); }}
                    >
                      <div
                        className="text-[11px] font-bold leading-tight truncate"
                        style={{ color }}
                      >
                        {ev.title}
                      </div>
                      {height > 36 && (
                        <div className="text-[9px] font-semibold" style={{ color, opacity: 0.75 }}>
                          {formatTime(ev.start_at)}
                          {ev.end_at && ` – ${formatTime(ev.end_at)}`}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Tasks */}
                {dayTasks.map(task => {
                  const due = new Date(task.due_at!);
                  const top = topPx(due);
                  if (top < 0 || top > HOURS.length * HOUR_HEIGHT) return null;
                  const impColor =
                    task.importance === "high"   ? "var(--danger)" :
                    task.importance === "medium" ? "var(--warning)" :
                                                   "var(--text-3)";
                  return (
                    <div
                      key={task.id}
                      className="absolute left-0 right-0 mx-1 flex items-center gap-1 px-1.5 rounded overflow-hidden"
                      style={{
                        top: `${top}px`,
                        height: "20px",
                        backgroundColor: "var(--surface)",
                        border: `1px solid ${impColor}`,
                        zIndex: 2,
                      }}
                      title={`${task.title} · due ${formatTime(task.due_at!)}`}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: impColor }}
                      />
                      <span
                        className="text-[10px] font-semibold truncate"
                        style={{ color: "var(--text-2)" }}
                      >
                        {task.title}
                      </span>
                    </div>
                  );
                })}

                {/* Current time line */}
                {today && <NowLine />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// All-day events strip
function AllDayStrip({ days, events }: { days: Date[]; events: Event[] }) {
  const allDayEvents = days.flatMap(day =>
    eventsForDay(events, day).filter(e => e.is_all_day).map(e => ({ day, event: e }))
  );
  if (allDayEvents.length === 0) return null;

  return (
    <div
      className="flex shrink-0"
      style={{ borderBottom: "1px solid var(--border)", paddingLeft: `${LEFT_GUTTER}px` }}
    >
      {days.map((day, i) => {
        const dayAllDay = allDayEvents.filter(x => isSameDay(x.day, day));
        return (
          <div
            key={i}
            className="flex-1 min-h-[28px] px-0.5 py-0.5 space-y-0.5"
            style={{ borderLeft: "1px solid var(--border)" }}
          >
            {dayAllDay.map(({ event: ev }) => {
              const color = EVENT_TYPE_COLORS[ev.type] ?? "var(--accent)";
              return (
                <div
                  key={ev.id}
                  className="truncate text-[10px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: color + "22", color }}
                >
                  {ev.title}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// Red "now" indicator line
function NowLine() {
  const now     = new Date();
  const top     = topPx(now);
  const visible = top >= 0 && top <= (GRID_END - GRID_START) * HOUR_HEIGHT;
  if (!visible) return null;

  return (
    <div
      className="absolute left-0 right-0 pointer-events-none z-10"
      style={{ top: `${top}px` }}
    >
      <div
        className="absolute w-full"
        style={{ height: "2px", backgroundColor: "var(--danger)", opacity: 0.8 }}
      />
      <div
        className="absolute w-2 h-2 rounded-full"
        style={{
          backgroundColor: "var(--danger)",
          top: "-3px",
          left: "-4px",
        }}
      />
    </div>
  );
}
