import type { Task } from "@/types";

// ── Design tokens ────────────────────────────────────────────────────────────

const NAVY       = "#0f1730";
const BLUE       = "#1a40c2";
const BLUE_LIGHT = "#3d5fd4";
const MUTED      = "#64748b";
const MUTED_MID  = "#94a3b8";
const BG         = "#f1f5f9";
const SURFACE    = "#ffffff";
const BORDER     = "#e2e8f0";
const RED        = "#a3000e";
const RED_BG     = "#fff1f2";
const RED_BORDER = "#fecaca";
const AMBER      = "#b45309";
const AMBER_BG   = "#fffbeb";
const AMBER_BORD = "#fde68a";
const GREEN      = "#15803d";
const GREEN_BG   = "#f0fdf4";

function formatDue(due_at: string) {
  return new Date(due_at).toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function impColor(importance: string): string {
  if (importance === "high")   return RED;
  if (importance === "medium") return AMBER;
  return MUTED_MID;
}

// ── Logo mark (inline HTML — works without external images) ─────────────────

const LOGO = `
<table cellpadding="0" cellspacing="0">
  <tr>
    <td style="background:${BLUE};border-radius:10px;width:36px;height:36px;text-align:center;vertical-align:middle;">
      <span style="color:#fff;font-weight:800;font-size:18px;line-height:36px;letter-spacing:-1px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">N</span>
    </td>
    <td style="padding-left:10px;vertical-align:middle;">
      <span style="font-size:17px;font-weight:700;color:${NAVY};letter-spacing:-0.5px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">Nudge</span>
    </td>
  </tr>
</table>`;

// ── Task card row ────────────────────────────────────────────────────────────

function taskCard(task: Task, opts: { overdue?: boolean } = {}) {
  const color    = impColor(task.importance);
  const dueStr   = task.due_at ? formatDue(task.due_at) : "";
  const catLabel = task.category.charAt(0).toUpperCase() + task.category.slice(1);
  const bgColor  = opts.overdue ? RED_BG : SURFACE;

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;border-radius:10px;overflow:hidden;border:1px solid ${opts.overdue ? RED_BORDER : BORDER};">
    <tr>
      <td width="4" style="background:${color};width:4px;border-radius:10px 0 0 10px;">&nbsp;</td>
      <td style="padding:11px 14px;background:${bgColor};border-radius:0 10px 10px 0;">
        <div style="font-size:14px;font-weight:600;color:${NAVY};margin-bottom:3px;line-height:1.3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${task.title}</div>
        <div style="font-size:11.5px;color:${MUTED};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <span style="font-weight:500;">${catLabel}</span>${dueStr ? `&nbsp;&nbsp;·&nbsp;&nbsp;${dueStr}` : ""}
        </div>
      </td>
    </tr>
  </table>`;
}

// ── Section header ───────────────────────────────────────────────────────────

function sectionHeader(label: string, count: number, color: string, bg: string, border: string) {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;margin-top:4px;">
    <tr>
      <td style="background:${bg};border:1px solid ${border};border-radius:6px;padding:6px 12px;">
        <span style="font-size:10.5px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:.1em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          ${label}&nbsp;&nbsp;<span style="font-weight:500;opacity:.75;">${count}</span>
        </span>
      </td>
    </tr>
  </table>`;
}

// ── Layout wrapper ───────────────────────────────────────────────────────────

function layout(title: string, body: string, accentBar?: string) {
  const bar = accentBar
    ? `<tr><td style="background:${accentBar};height:4px;border-radius:16px 16px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>`
    : `<tr><td style="background:linear-gradient(135deg,${BLUE} 0%,${BLUE_LIGHT} 100%);height:4px;border-radius:16px 16px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:48px 16px 56px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">

        <!-- Logo row -->
        <tr><td style="padding-bottom:24px;padding-left:4px;">
          ${LOGO}
        </td></tr>

        <!-- Card -->
        <tr><td style="background:${SURFACE};border-radius:16px;box-shadow:0 2px 16px rgba(15,23,48,0.09),0 1px 4px rgba(15,23,48,0.06);overflow:hidden;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${bar}
            <tr><td style="padding:32px 32px 36px;">
              ${body}
            </td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding-top:24px;text-align:center;">
          <p style="margin:0;font-size:11.5px;color:${MUTED_MID};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
            <span style="font-weight:600;color:${MUTED};">Nudge</span>&nbsp;&nbsp;·&nbsp;&nbsp;Your personal task workspace
          </p>
          <p style="margin:6px 0 0;font-size:10.5px;color:${MUTED_MID};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
            You're receiving this because email reminders are enabled in your settings.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Daily digest ─────────────────────────────────────────────────────────────

export function dailyDigest(tasks: Task[]): { subject: string; html: string } {
  const now     = new Date();
  const hour    = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" : "Good evening";

  const overdue = tasks.filter(t => t.due_at && new Date(t.due_at) < now);
  const today   = tasks.filter(t => !overdue.includes(t));

  const overdueSection = overdue.length > 0 ? `
    ${sectionHeader("Overdue", overdue.length, RED, RED_BG, RED_BORDER)}
    ${overdue.map(t => taskCard(t, { overdue: true })).join("")}
    <div style="height:20px;"></div>` : "";

  const todaySection = today.length > 0 ? `
    ${sectionHeader("Due Today", today.length, AMBER, AMBER_BG, AMBER_BORD)}
    ${today.map(t => taskCard(t)).join("")}` : "";

  const emptyState = tasks.length === 0 ? `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="text-align:center;padding:32px 0 16px;">
        <div style="font-size:32px;margin-bottom:12px;">✓</div>
        <p style="margin:0;font-size:15px;font-weight:600;color:${NAVY};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">All clear</p>
        <p style="margin:6px 0 0;font-size:13px;color:${MUTED};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">Nothing overdue or due today — enjoy the day.</p>
      </td></tr>
    </table>` : "";

  const taskWord = tasks.length === 1 ? "task" : "tasks";
  const dateStr  = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const body = `
    <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:${MUTED_MID};text-transform:uppercase;letter-spacing:.12em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${dateStr}</p>
    <h1 style="margin:0 0 6px;font-size:24px;font-weight:700;color:${NAVY};letter-spacing:-0.5px;line-height:1.2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${greeting}</h1>
    <p style="margin:0 0 28px;font-size:14px;color:${MUTED};line-height:1.5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      ${tasks.length > 0 ? `You have <strong style="color:${NAVY};">${tasks.length} ${taskWord}</strong> that need your attention today.` : "Here's your focus for today."}
    </p>
    ${overdueSection}
    ${todaySection}
    ${emptyState}`;

  return {
    subject: tasks.length === 0
      ? "Nudge — All clear today ✓"
      : `Nudge — ${tasks.length} ${taskWord} need your attention`,
    html: layout("Daily digest", body),
  };
}

// ── Due in 24 hours ──────────────────────────────────────────────────────────

export function due24h(task: Task): { subject: string; html: string } {
  const dueStr  = task.due_at ? formatDue(task.due_at) : "";
  const color   = impColor(task.importance);
  const catLabel = task.category.charAt(0).toUpperCase() + task.category.slice(1);

  const body = `
    <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:${MUTED_MID};text-transform:uppercase;letter-spacing:.12em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">Deadline Reminder</p>
    <h1 style="margin:0 0 6px;font-size:24px;font-weight:700;color:${NAVY};letter-spacing:-0.5px;line-height:1.2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">Due in 24 hours</h1>
    <p style="margin:0 0 28px;font-size:14px;color:${MUTED};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">Don't let this one slip.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid ${BORDER};margin-bottom:8px;">
      <tr>
        <td width="4" style="background:${color};width:4px;">&nbsp;</td>
        <td style="padding:16px 18px;background:${SURFACE};">
          <div style="font-size:16px;font-weight:700;color:${NAVY};margin-bottom:6px;letter-spacing:-0.3px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${task.title}</div>
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:12px;">
                <span style="font-size:11px;font-weight:600;color:${MUTED_MID};text-transform:uppercase;letter-spacing:.08em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">Category</span><br/>
                <span style="font-size:13px;color:${NAVY};font-weight:500;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${catLabel}</span>
              </td>
              ${dueStr ? `<td>
                <span style="font-size:11px;font-weight:600;color:${MUTED_MID};text-transform:uppercase;letter-spacing:.08em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">Due</span><br/>
                <span style="font-size:13px;color:${AMBER};font-weight:600;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${dueStr}</span>
              </td>` : ""}
            </tr>
          </table>
        </td>
      </tr>
    </table>`;

  return {
    subject: `Nudge — "${task.title}" is due tomorrow`,
    html: layout("Due in 24 hours", body, AMBER),
  };
}

// ── Due in 2 hours ───────────────────────────────────────────────────────────

export function due2h(task: Task): { subject: string; html: string } {
  const dueStr   = task.due_at ? formatDue(task.due_at) : "";
  const catLabel = task.category.charAt(0).toUpperCase() + task.category.slice(1);

  const body = `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="background:#fef3c7;border:1px solid ${AMBER_BORD};border-radius:8px;padding:10px 14px;">
          <span style="font-size:12px;font-weight:700;color:${AMBER};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">⚡&nbsp;&nbsp;High priority · 2 hours remaining</span>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:${MUTED_MID};text-transform:uppercase;letter-spacing:.12em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">Urgent</p>
    <h1 style="margin:0 0 6px;font-size:24px;font-weight:700;color:${NAVY};letter-spacing:-0.5px;line-height:1.2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">Almost out of time</h1>
    <p style="margin:0 0 28px;font-size:14px;color:${MUTED};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">This high-priority task needs your attention now.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid ${AMBER_BORD};margin-bottom:8px;">
      <tr>
        <td width="4" style="background:${RED};width:4px;">&nbsp;</td>
        <td style="padding:16px 18px;background:${AMBER_BG};">
          <div style="font-size:16px;font-weight:700;color:${NAVY};margin-bottom:6px;letter-spacing:-0.3px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${task.title}</div>
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:12px;">
                <span style="font-size:11px;font-weight:600;color:${MUTED_MID};text-transform:uppercase;letter-spacing:.08em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">Category</span><br/>
                <span style="font-size:13px;color:${NAVY};font-weight:500;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${catLabel}</span>
              </td>
              ${dueStr ? `<td>
                <span style="font-size:11px;font-weight:600;color:${MUTED_MID};text-transform:uppercase;letter-spacing:.08em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">Due</span><br/>
                <span style="font-size:13px;color:${RED};font-weight:700;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${dueStr}</span>
              </td>` : ""}
            </tr>
          </table>
        </td>
      </tr>
    </table>`;

  return {
    subject: `Nudge — ⚡ "${task.title}" is due in 2 hours`,
    html: layout("Due in 2 hours", body, RED),
  };
}

// ── Overdue (once) ───────────────────────────────────────────────────────────

export function overdueOnce(task: Task): { subject: string; html: string } {
  const dueStr   = task.due_at ? formatDue(task.due_at) : "";
  const catLabel = task.category.charAt(0).toUpperCase() + task.category.slice(1);

  const body = `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="background:${RED_BG};border:1px solid ${RED_BORDER};border-radius:8px;padding:10px 14px;">
          <span style="font-size:12px;font-weight:700;color:${RED};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">⚠&nbsp;&nbsp;This task is overdue</span>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:${RED};text-transform:uppercase;letter-spacing:.12em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">Missed Deadline</p>
    <h1 style="margin:0 0 6px;font-size:24px;font-weight:700;color:${NAVY};letter-spacing:-0.5px;line-height:1.2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">You missed this one</h1>
    <p style="margin:0 0 28px;font-size:14px;color:${MUTED};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">Complete it now, reschedule it, or delete it — but don't leave it hanging.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid ${RED_BORDER};margin-bottom:8px;">
      <tr>
        <td width="4" style="background:${RED};width:4px;">&nbsp;</td>
        <td style="padding:16px 18px;background:${RED_BG};">
          <div style="font-size:16px;font-weight:700;color:${NAVY};margin-bottom:6px;letter-spacing:-0.3px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${task.title}</div>
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:12px;">
                <span style="font-size:11px;font-weight:600;color:${MUTED_MID};text-transform:uppercase;letter-spacing:.08em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">Category</span><br/>
                <span style="font-size:13px;color:${NAVY};font-weight:500;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${catLabel}</span>
              </td>
              ${dueStr ? `<td>
                <span style="font-size:11px;font-weight:600;color:${MUTED_MID};text-transform:uppercase;letter-spacing:.08em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">Was due</span><br/>
                <span style="font-size:13px;color:${RED};font-weight:700;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${dueStr}</span>
              </td>` : ""}
            </tr>
          </table>
        </td>
      </tr>
    </table>`;

  return {
    subject: `Nudge — "${task.title}" is overdue`,
    html: layout("Overdue task", body, RED),
  };
}
