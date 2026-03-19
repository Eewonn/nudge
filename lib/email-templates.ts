import type { Task } from "@/types";

const BLUE = "#3b5bdb";
const NAVY = "#0f1730";
const MUTED = "#7585b5";
const BG = "#f4f7ff";
const SURFACE = "#ffffff";
const BORDER = "#ccd4ef";
const RED = "#dc2626";
const AMBER = "#d97706";
const GREEN = "#166534";

function formatDue(due_at: string) {
  return new Date(due_at).toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function layout(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <!-- Logo -->
        <tr><td style="padding-bottom:28px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:${BLUE};border-radius:8px;width:30px;height:30px;text-align:center;vertical-align:middle;">
                <span style="color:#fff;font-weight:700;font-size:14px;line-height:30px;">N</span>
              </td>
              <td style="padding-left:10px;font-size:16px;font-weight:600;color:${NAVY};letter-spacing:-0.3px;">nudge</td>
            </tr>
          </table>
        </td></tr>
        <!-- Card -->
        <tr><td style="background:${SURFACE};border:1px solid ${BORDER};border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(59,91,219,0.08);">
          ${body}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding-top:20px;text-align:center;font-size:11px;color:${MUTED};">
          Nudge · Your personal task workspace
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function taskRow(task: Task, opts: { showImportance?: boolean } = {}) {
  const impColor =
    task.importance === "high"   ? RED :
    task.importance === "medium" ? AMBER : BORDER;

  const dueStr = task.due_at ? formatDue(task.due_at) : "";

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
    <tr>
      <td style="width:3px;background:${impColor};border-radius:2px;opacity:${task.importance === "low" ? 0.4 : 1};" width="3">&nbsp;</td>
      <td style="padding:10px 12px;background:${BG};border:1px solid ${BORDER};border-left:none;border-radius:0 10px 10px 0;">
        <div style="font-size:13.5px;font-weight:500;color:${NAVY};margin-bottom:2px;">${task.title}</div>
        <div style="font-size:11.5px;color:${MUTED};">
          ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}
          ${dueStr ? `&nbsp;·&nbsp;${dueStr}` : ""}
          ${opts.showImportance ? `&nbsp;·&nbsp;${task.importance} importance` : ""}
        </div>
      </td>
    </tr>
  </table>`;
}

// ─── Daily digest ───────────────────────────────────────────────────────────

export function dailyDigest(tasks: Task[]): { subject: string; html: string } {
  const overdue  = tasks.filter(t => t.due_at && new Date(t.due_at) < new Date());
  const today    = tasks.filter(t => !overdue.includes(t));

  const overdueSection = overdue.length > 0 ? `
    <p style="font-size:11px;font-weight:600;color:${RED};text-transform:uppercase;letter-spacing:.08em;margin:0 0 10px;">
      Overdue (${overdue.length})
    </p>
    ${overdue.map(t => taskRow(t)).join("")}
    <div style="margin-bottom:20px;"></div>` : "";

  const todaySection = today.length > 0 ? `
    <p style="font-size:11px;font-weight:600;color:${AMBER};text-transform:uppercase;letter-spacing:.08em;margin:0 0 10px;">
      Due today (${today.length})
    </p>
    ${today.map(t => taskRow(t)).join("")}` : "";

  const emptyState = tasks.length === 0 ? `
    <p style="font-size:14px;color:${MUTED};text-align:center;padding:24px 0;">
      Nothing on your plate — enjoy the day!
    </p>` : "";

  const body = `
    <h1 style="margin:0 0 6px;font-size:20px;font-weight:600;color:${NAVY};letter-spacing:-0.3px;">Good morning</h1>
    <p style="margin:0 0 24px;font-size:14px;color:${MUTED};">Here's your focus for today.</p>
    ${overdueSection}
    ${todaySection}
    ${emptyState}`;

  return {
    subject: tasks.length === 0
      ? "Nudge — All clear today"
      : `Nudge — ${tasks.length} task${tasks.length > 1 ? "s" : ""} need your attention`,
    html: layout("Your daily digest", body),
  };
}

// ─── Due in 24 hours ────────────────────────────────────────────────────────

export function due24h(task: Task): { subject: string; html: string } {
  const body = `
    <h1 style="margin:0 0 6px;font-size:20px;font-weight:600;color:${NAVY};letter-spacing:-0.3px;">Due in 24 hours</h1>
    <p style="margin:0 0 24px;font-size:14px;color:${MUTED};">Don't let this one slip.</p>
    ${taskRow(task)}`;

  return {
    subject: `Nudge — "${task.title}" is due tomorrow`,
    html: layout("Due in 24 hours", body),
  };
}

// ─── Due in 2 hours ─────────────────────────────────────────────────────────

export function due2h(task: Task): { subject: string; html: string } {
  const body = `
    <div style="background:#eef2ff;border:1px solid ${BORDER};border-radius:10px;padding:12px 16px;margin-bottom:20px;">
      <p style="margin:0;font-size:12px;font-weight:600;color:${BLUE};">⚡ High importance · 2 hours left</p>
    </div>
    <h1 style="margin:0 0 6px;font-size:20px;font-weight:600;color:${NAVY};letter-spacing:-0.3px;">Almost out of time</h1>
    <p style="margin:0 0 24px;font-size:14px;color:${MUTED};">This task needs your attention now.</p>
    ${taskRow(task, { showImportance: true })}`;

  return {
    subject: `Nudge — ⚡ "${task.title}" is due in 2 hours`,
    html: layout("Due in 2 hours", body),
  };
}

// ─── Overdue (once) ─────────────────────────────────────────────────────────

export function overdueOnce(task: Task): { subject: string; html: string } {
  const body = `
    <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;padding:12px 16px;margin-bottom:20px;">
      <p style="margin:0;font-size:12px;font-weight:600;color:${RED};">This task is overdue</p>
    </div>
    <h1 style="margin:0 0 6px;font-size:20px;font-weight:600;color:${NAVY};letter-spacing:-0.3px;">Missed deadline</h1>
    <p style="margin:0 0 24px;font-size:14px;color:${MUTED};">Complete it or reschedule — don't leave it hanging.</p>
    ${taskRow(task)}`;

  return {
    subject: `Nudge — "${task.title}" is overdue`,
    html: layout("Overdue task", body),
  };
}
