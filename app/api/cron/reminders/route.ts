import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { getPendingReminders, type ReminderType } from "@/lib/reminders";
import { sendEmail } from "@/lib/email";
import {
  dailyDigest, due24h, due2h, overdueOnce,
  eventReminder24h, eventReminder2h,
} from "@/lib/email-templates";
import { groupTasks } from "@/lib/priority";
import type { Task, Event } from "@/types";

// Vercel invokes this with Authorization: Bearer <CRON_SECRET>
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  return handler(req);
}

export async function POST(req: NextRequest) {
  return handler(req);
}

async function handler(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // ── Get the single app user ────────────────────────────────────────────
  const { data: { users }, error: usersError } = await admin.auth.admin.listUsers();
  if (usersError || !users.length) {
    return NextResponse.json({ error: "Could not resolve user" }, { status: 500 });
  }
  const user = users[0];
  const meta = user.user_metadata ?? {};

  // ── Check master email toggle ──────────────────────────────────────────
  const emailEnabled = meta.notif_email_enabled ?? true;
  if (!emailEnabled) {
    return NextResponse.json({ ran: 0, results: [], note: "Email reminders disabled by user" });
  }

  const prefMap: Record<ReminderType, boolean> = {
    "daily-digest": meta.notif_daily_digest ?? true,
    "due-24h":      meta.notif_due_24h      ?? true,
    "due-2h":       meta.notif_due_2h       ?? true,
    "overdue-once": meta.notif_overdue      ?? true,
    "event-24h":    meta.notif_event_24h    ?? true,
    "event-2h":     meta.notif_event_2h     ?? true,
  };

  // ── Fetch active tasks ─────────────────────────────────────────────────
  const { data: tasks, error: tasksError } = await admin
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_completed", false);

  if (tasksError) {
    return NextResponse.json({ error: tasksError.message }, { status: 500 });
  }

  // ── Fetch upcoming events (next 48h) ───────────────────────────────────
  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();
  const { data: events, error: eventsError } = await admin
    .from("events")
    .select("*")
    .eq("user_id", user.id)
    .gte("start_at", now.toISOString())
    .lte("start_at", in48h);

  if (eventsError) {
    return NextResponse.json({ error: eventsError.message }, { status: 500 });
  }

  // ── Fetch recent reminder_logs (last 48h) ──────────────────────────────
  const since = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
  const { data: logs, error: logsError } = await admin
    .from("reminder_logs")
    .select("entity_id, entity_type, reminder_type, sent_at")
    .eq("user_id", user.id)
    .gte("sent_at", since);

  if (logsError) {
    return NextResponse.json({ error: logsError.message }, { status: 500 });
  }

  // ── Determine digest tasks (overdue + today) ───────────────────────────
  const grouped = groupTasks(tasks as Task[]);
  const digestTasks = [...grouped.overdue, ...grouped.today];

  // ── Get pending reminders, filtered by user prefs ─────────────────────
  const allPending = getPendingReminders(
    tasks as Task[],
    events as Event[],
    logs as { entity_id: string | null; entity_type: string | null; reminder_type: ReminderType; sent_at: string }[],
    digestTasks
  );
  const pending = allPending.filter(({ type }) => prefMap[type]);

  const results: { type: ReminderType; entityId: string | null; entityType: string | null; ok: boolean; error?: string }[] = [];

  for (const { task, event, type } of pending) {
    const entityId   = task?.id ?? event?.id ?? null;
    const entityType = task ? "task" : event ? "event" : null;

    try {
      let subject: string;
      let html: string;

      if (type === "daily-digest") {
        ({ subject, html } = dailyDigest(digestTasks));
      } else if (type === "due-24h") {
        ({ subject, html } = due24h(task!));
      } else if (type === "due-2h") {
        ({ subject, html } = due2h(task!));
      } else if (type === "overdue-once") {
        ({ subject, html } = overdueOnce(task!));
      } else if (type === "event-24h") {
        ({ subject, html } = eventReminder24h(event!));
      } else {
        ({ subject, html } = eventReminder2h(event!));
      }

      await sendEmail(subject, html);

      await admin.from("reminder_logs").insert({
        entity_id:   entityId,
        entity_type: entityType,
        user_id:     user.id,
        reminder_type: type,
        status: "sent",
      });

      results.push({ type, entityId, entityType, ok: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      await admin.from("reminder_logs").insert({
        entity_id:   entityId,
        entity_type: entityType,
        user_id:     user.id,
        reminder_type: type,
        status: "failed",
      });

      results.push({ type, entityId, entityType, ok: false, error: message });
    }
  }

  return NextResponse.json({ ran: results.length, results });
}
