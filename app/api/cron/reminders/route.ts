import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getPendingReminders, type ReminderType } from "@/lib/reminders";
import { sendEmail } from "@/lib/email";
import { dailyDigest, due24h, due2h, overdueOnce } from "@/lib/email-templates";
import { groupTasks } from "@/lib/priority";
import type { Task } from "@/types";

// Vercel invokes this with Authorization: Bearer <CRON_SECRET>
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // ── Fetch the single app user ──────────────────────────────────────────
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    // For a cron job we need a service-role approach; fall back to anon user list
    return NextResponse.json({ error: "Could not resolve user" }, { status: 500 });
  }

  // ── Fetch active tasks ─────────────────────────────────────────────────
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("*")
    .eq("is_completed", false);

  if (tasksError) {
    return NextResponse.json({ error: tasksError.message }, { status: 500 });
  }

  // ── Fetch recent reminder_logs (last 48h) ──────────────────────────────
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const { data: logs, error: logsError } = await supabase
    .from("reminder_logs")
    .select("task_id, reminder_type, sent_at")
    .eq("user_id", user.id)
    .gte("sent_at", since);

  if (logsError) {
    return NextResponse.json({ error: logsError.message }, { status: 500 });
  }

  // ── Determine digest tasks (overdue + today) ───────────────────────────
  const grouped = groupTasks(tasks as Task[]);
  const digestTasks = [...grouped.overdue, ...grouped.today];

  // ── Get pending reminders ──────────────────────────────────────────────
  const pending = getPendingReminders(
    tasks as Task[],
    logs as { task_id: string | null; reminder_type: ReminderType; sent_at: string }[],
    digestTasks
  );

  const results: { type: ReminderType; taskId: string | null; ok: boolean; error?: string }[] = [];

  for (const { task, type } of pending) {
    try {
      let subject: string;
      let html: string;

      if (type === "daily-digest") {
        ({ subject, html } = dailyDigest(digestTasks));
      } else if (type === "due-24h") {
        ({ subject, html } = due24h(task!));
      } else if (type === "due-2h") {
        ({ subject, html } = due2h(task!));
      } else {
        ({ subject, html } = overdueOnce(task!));
      }

      await sendEmail(subject, html);

      // Log success
      await supabase.from("reminder_logs").insert({
        task_id: task?.id ?? null,
        user_id: user.id,
        reminder_type: type,
        status: "sent",
      });

      results.push({ type, taskId: task?.id ?? null, ok: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      // Log failure (best-effort)
      await supabase.from("reminder_logs").insert({
        task_id: task?.id ?? null,
        user_id: user.id,
        reminder_type: type,
        status: "failed",
      });

      results.push({ type, taskId: task?.id ?? null, ok: false, error: message });
    }
  }

  return NextResponse.json({
    ran: results.length,
    results,
  });
}
