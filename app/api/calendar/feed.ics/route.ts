import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import type { Event } from "@/types";

function fmtDt(iso: string): string {
  // Convert ISO to ICS datetime: 20260320T090000Z
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function fmtDate(iso: string): string {
  // Convert ISO to ICS date-only: 20260320
  return iso.slice(0, 10).replace(/-/g, "");
}

function escapeIcs(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function foldLine(line: string): string {
  // ICS spec: lines > 75 chars should be folded
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  chunks.push(line.slice(0, 75));
  let i = 75;
  while (i < line.length) {
    chunks.push(" " + line.slice(i, i + 74));
    i += 74;
  }
  return chunks.join("\r\n");
}

function eventToVEvent(ev: Event): string {
  const lines: string[] = [
    "BEGIN:VEVENT",
    `UID:${ev.id}@nudge.app`,
    `DTSTAMP:${fmtDt(ev.updated_at ?? ev.created_at)}`,
    `SUMMARY:${escapeIcs(ev.title)}`,
  ];

  if (ev.is_all_day) {
    lines.push(`DTSTART;VALUE=DATE:${fmtDate(ev.start_at)}`);
    if (ev.end_at) {
      lines.push(`DTEND;VALUE=DATE:${fmtDate(ev.end_at)}`);
    }
  } else {
    lines.push(`DTSTART:${fmtDt(ev.start_at)}`);
    if (ev.end_at) lines.push(`DTEND:${fmtDt(ev.end_at)}`);
  }

  if (ev.location)    lines.push(`LOCATION:${escapeIcs(ev.location)}`);
  if (ev.notes)       lines.push(`DESCRIPTION:${escapeIcs(ev.notes)}`);
  if (ev.url)         lines.push(`URL:${ev.url}`);

  if (ev.recurrence_rule) {
    const freq = ev.recurrence_rule.toUpperCase();
    lines.push(`RRULE:FREQ=${freq}`);
  }

  lines.push("END:VEVENT");
  return lines.map(foldLine).join("\r\n");
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token || token !== process.env.CALENDAR_FEED_TOKEN) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: events, error } = await admin
    .from("events")
    .select("*")
    .order("start_at", { ascending: true });

  if (error) return new NextResponse("Internal error", { status: 500 });

  const vevents = (events as Event[]).map(eventToVEvent).join("\r\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nudge//Nudge Calendar//EN",
    "X-WR-CALNAME:Nudge",
    "X-WR-TIMEZONE:UTC",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    vevents,
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="nudge.ics"',
      "Cache-Control": "no-cache, no-store",
    },
  });
}
