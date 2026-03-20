"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import type { EventType, Category, Importance } from "@/types";

interface ParsedVEvent {
  uid:        string;
  summary:    string;
  start_at:   string;
  end_at:     string | null;
  is_all_day: boolean;
  location:   string | null;
  description: string | null;
  url:        string | null;
  rrule:      string | null;
}

function unescapeIcs(str: string): string {
  return str.replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
}

function parseIcsDate(val: string): { iso: string; allDay: boolean } {
  // DATE-only: 20260320
  if (/^\d{8}$/.test(val)) {
    const y = val.slice(0, 4), m = val.slice(4, 6), d = val.slice(6, 8);
    return { iso: `${y}-${m}-${d}T00:00:00.000Z`, allDay: true };
  }
  // DATETIME: 20260320T090000Z or 20260320T090000
  const match = val.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (match) {
    const [, y, mo, d, h, min, s, z] = match;
    return {
      iso: `${y}-${mo}-${d}T${h}:${min}:${s}.000${z ? "Z" : ""}`,
      allDay: false,
    };
  }
  return { iso: new Date(val).toISOString(), allDay: false };
}

function parseIcsContent(content: string): ParsedVEvent[] {
  // Unfold lines (continuation lines start with space or tab)
  const unfolded = content.replace(/\r\n[ \t]/g, "").replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
  const events: ParsedVEvent[] = [];

  const vevents = unfolded.split("BEGIN:VEVENT").slice(1);
  for (const block of vevents) {
    const end = block.indexOf("END:VEVENT");
    const body = end !== -1 ? block.slice(0, end) : block;

    const get = (key: string): string | null => {
      const re = new RegExp(`^${key}(?:;[^:]*)?:(.*)$`, "mi");
      const m = body.match(re);
      return m ? unescapeIcs(m[1].trim()) : null;
    };

    const uid     = get("UID") ?? crypto.randomUUID();
    const summary = get("SUMMARY") ?? "Untitled";

    // Parse DTSTART — handle VALUE=DATE param
    const dtStartRaw = body.match(/^DTSTART(?:;[^:]*)?:(.*)$/mi)?.[1]?.trim() ?? "";
    const dtEndRaw   = body.match(/^DTEND(?:;[^:]*)?:(.*)$/mi)?.[1]?.trim() ?? "";
    const isAllDayParam = /DTSTART;[^:]*VALUE=DATE:/i.test(body);

    const { iso: startIso, allDay: allDayFromVal } = parseIcsDate(dtStartRaw);
    const isAllDay = isAllDayParam || allDayFromVal;

    let endIso: string | null = null;
    if (dtEndRaw) {
      endIso = parseIcsDate(dtEndRaw).iso;
    }

    const rruleLine = get("RRULE");
    let rrule: string | null = null;
    if (rruleLine) {
      const freqMatch = rruleLine.match(/FREQ=(\w+)/i);
      if (freqMatch) rrule = freqMatch[1].toLowerCase(); // "daily" | "weekly" | "monthly"
    }

    events.push({
      uid,
      summary,
      start_at:    startIso,
      end_at:      endIso,
      is_all_day:  isAllDay,
      location:    get("LOCATION"),
      description: get("DESCRIPTION"),
      url:         get("URL"),
      rrule,
    });
  }

  return events;
}

export interface IcsImportResult {
  imported: number;
  skipped:  number;
  errors:   number;
}

export async function importIcsFile(content: string): Promise<IcsImportResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const parsed = parseIcsContent(content);
  let imported = 0, skipped = 0, errors = 0;

  for (const ev of parsed) {
    if (!ev.summary || !ev.start_at) { skipped++; continue; }

    try {
      const { error } = await supabase.from("events").upsert({
        user_id:          user.id,
        title:            ev.summary,
        notes:            ev.description,
        type:             "event" as EventType,
        start_at:         ev.start_at,
        end_at:           ev.end_at,
        is_all_day:       ev.is_all_day,
        location:         ev.location,
        url:              ev.url,
        recurrence_rule:  ev.rrule,
        category:         "personal" as Category,
        importance:       "medium" as Importance,
      }, { onConflict: "id", ignoreDuplicates: false });

      if (error) { errors++; } else { imported++; }
    } catch {
      errors++;
    }
  }

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { imported, skipped, errors };
}
