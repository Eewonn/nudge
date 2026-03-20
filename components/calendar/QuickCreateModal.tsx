"use client";

import { useState, useTransition } from "react";
import { X, CalendarDays, CheckSquare, Mic, Loader2 } from "lucide-react";
import { createEvent } from "@/app/actions/events";
import { createTask } from "@/app/actions/tasks";
import { parseVoiceEvent, parseVoiceCapture } from "@/app/actions/capture";
import { useSpeechInput } from "@/hooks/useSpeechInput";
import type { Event, Task, EventType, Category, Importance } from "@/types";

interface Props {
  slot: { date: string; hour?: number };
  onClose: () => void;
  onEventCreated: (event: Event) => void;
  onTaskCreated: (task: Task) => void;
}

const EVENT_TYPES: EventType[] = ["meeting", "event", "block", "reminder"];
const CATEGORIES: Category[] = ["work", "personal", "academics", "acm", "thesis", "other"];

function toLocalDatetimeValue(date: string, hour?: number): string {
  const d = new Date(date);
  d.setHours(hour ?? 9, 0, 0, 0);
  // Format: YYYY-MM-DDTHH:mm
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:00`;
}

function toEndValue(date: string, hour?: number): string {
  const d = new Date(date);
  d.setHours((hour ?? 9) + 1, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:00`;
}

function isoToLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function QuickCreateModal({ slot, onClose, onEventCreated, onTaskCreated }: Props) {
  const [kind, setKind] = useState<"event" | "task">("event");
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<EventType>("event");
  const [startAt, setStartAt] = useState(toLocalDatetimeValue(slot.date, slot.hour));
  const [endAt, setEndAt] = useState(toEndValue(slot.date, slot.hour));
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<Category>("personal");
  const [importance, setImportance] = useState<Importance>("medium");
  const [dueAt, setDueAt] = useState(toLocalDatetimeValue(slot.date, slot.hour));
  const [isPending, startTransition] = useTransition();
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "parsing">("idle");
  const speech = useSpeechInput();

  async function handleMic() {
    if (voiceState === "listening") {
      speech.stop();
      return;
    }
    if (voiceState !== "idle") return;
    setVoiceState("listening");
    speech.start(async (transcript) => {
      setVoiceState("parsing");
      try {
        if (kind === "event") {
          const parsed = await parseVoiceEvent(transcript);
          setTitle(parsed.title);
          setEventType(parsed.type);
          setStartAt(isoToLocalInput(parsed.start_at));
          if (parsed.end_at) setEndAt(isoToLocalInput(parsed.end_at));
          if (parsed.location) setLocation(parsed.location);
          setCategory(parsed.category);
          setImportance(parsed.importance);
        } else {
          const parsed = await parseVoiceCapture(transcript);
          setTitle(parsed.title);
          if (parsed.due_at) setDueAt(isoToLocalInput(parsed.due_at));
          setCategory(parsed.category);
          setImportance(parsed.importance);
        }
      } catch {
        setTitle(transcript);
      } finally {
        setVoiceState("idle");
      }
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    startTransition(async () => {
      if (kind === "event") {
        const event = await createEvent({
          title: title.trim(),
          type: eventType,
          start_at: new Date(startAt).toISOString(),
          end_at: new Date(endAt).toISOString(),
          location: location.trim() || null,
          category,
          importance,
        });
        onEventCreated(event);
      } else {
        const task = await createTask({
          title: title.trim(),
          category,
          importance,
          due_at: new Date(dueAt).toISOString(),
        });
        onTaskCreated(task);
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl"
        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {/* Kind toggle */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: "var(--surface-2)" }}>
            {(["event", "task"] as const).map(k => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all"
                style={{
                  backgroundColor: kind === k ? "var(--surface)" : "transparent",
                  color: kind === k ? "var(--accent)" : "var(--text-3)",
                  boxShadow: kind === k ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {k === "event" ? <CalendarDays className="w-3.5 h-3.5" /> : <CheckSquare className="w-3.5 h-3.5" />}
                {k === "event" ? "Event" : "Task"}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-3)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={
                voiceState === "listening" ? "Listening…" :
                voiceState === "parsing"   ? "Parsing…" :
                kind === "event"           ? "Event title" : "Task title"
              }
              className="flex-1 text-base font-semibold bg-transparent outline-none placeholder:text-[var(--text-3)]"
              style={{ color: "var(--text)" }}
            />
            {speech.supported && (
              <button
                type="button"
                onClick={handleMic}
                disabled={voiceState === "parsing"}
                className="shrink-0 p-1.5 rounded-lg transition-all"
                style={{
                  color: voiceState === "listening" ? "var(--danger)" : "var(--text-3)",
                  backgroundColor: voiceState === "listening" ? "rgba(239,68,68,0.1)" : "transparent",
                }}
                title="Voice input"
              >
                {voiceState === "parsing"
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Mic className="w-4 h-4" />}
              </button>
            )}
          </div>

          {kind === "event" ? (
            <>
              {/* Event type */}
              <div className="flex flex-wrap gap-1.5">
                {EVENT_TYPES.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEventType(t)}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize transition-all"
                    style={{
                      backgroundColor: eventType === t ? "var(--accent-subtle)" : "var(--surface-2)",
                      color: eventType === t ? "var(--accent)" : "var(--text-2)",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-3)" }}>Start</label>
                  <input
                    type="datetime-local"
                    value={startAt}
                    onChange={e => setStartAt(e.target.value)}
                    className="w-full text-sm rounded-lg px-3 py-2 outline-none"
                    style={{ backgroundColor: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-3)" }}>End</label>
                  <input
                    type="datetime-local"
                    value={endAt}
                    onChange={e => setEndAt(e.target.value)}
                    className="w-full text-sm rounded-lg px-3 py-2 outline-none"
                    style={{ backgroundColor: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}
                  />
                </div>
              </div>

              {/* Location */}
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Location (optional)"
                className="w-full text-sm rounded-lg px-3 py-2 outline-none"
                style={{ backgroundColor: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}
              />
            </>
          ) : (
            <>
              {/* Due date */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-3)" }}>Due</label>
                <input
                  type="datetime-local"
                  value={dueAt}
                  onChange={e => setDueAt(e.target.value)}
                  className="w-full text-sm rounded-lg px-3 py-2 outline-none"
                  style={{ backgroundColor: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}
                />
              </div>
            </>
          )}

          {/* Category + Importance row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-3)" }}>Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as Category)}
                className="w-full text-sm rounded-lg px-3 py-2 outline-none capitalize"
                style={{ backgroundColor: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-3)" }}>Importance</label>
              <select
                value={importance}
                onChange={e => setImportance(e.target.value as Importance)}
                className="w-full text-sm rounded-lg px-3 py-2 outline-none"
                style={{ backgroundColor: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending || !title.trim()}
            className="w-full py-2.5 rounded-xl text-sm font-bold transition-opacity disabled:opacity-50"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-fg)" }}
          >
            {isPending ? "Creating…" : kind === "event" ? "Create Event" : "Create Task"}
          </button>
        </form>
      </div>
    </div>
  );
}
