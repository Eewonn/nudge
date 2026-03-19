import Link from "next/link";
import { AlertCircle, CalendarClock, CheckCircle2, ArrowRight } from "lucide-react";
import { getTasks } from "@/app/actions/tasks";
import { groupTasks } from "@/lib/priority";
import type { Task } from "@/types";

export const dynamic = "force-dynamic";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function StatCard({
  label,
  value,
  icon: Icon,
  style,
  href,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  style: React.CSSProperties;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3.5 rounded-2xl border border-border bg-surface p-5 hover:border-border-strong transition-colors group"
    >
      <div className="rounded-xl p-2.5 shrink-0" style={style}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-semibold text-text tabular-nums">{value}</p>
        <p className="text-xs text-text-3 mt-0.5">{label}</p>
      </div>
    </Link>
  );
}

function FocusRow({ task }: { task: Task }) {
  const isOverdue = task.due_at && new Date(task.due_at) < new Date();
  const dueLabel = task.due_at
    ? new Date(task.due_at).toLocaleString(undefined, {
        month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit",
      })
    : null;

  const impColor =
    task.importance === "high"   ? "var(--imp-high)" :
    task.importance === "medium" ? "var(--imp-medium)" :
                                   "var(--imp-low)";

  return (
    <div className="flex items-center gap-3 py-2.5 group">
      <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: impColor }} />
      <span className="flex-1 text-sm text-text truncate">{task.title}</span>
      {dueLabel && (
        <span
          className="text-[11px] shrink-0 tabular-nums"
          style={{ color: isOverdue ? "var(--danger)" : "var(--text-3)" }}
        >
          {dueLabel}
        </span>
      )}
    </div>
  );
}

export default async function DashboardPage() {
  const tasks = await getTasks();
  const grouped = groupTasks(tasks);

  const overdueCount   = grouped.overdue.length;
  const todayCount     = grouped.today.length;
  const completedToday = tasks.filter(
    (t) =>
      t.is_completed &&
      t.completed_at &&
      new Date(t.completed_at).toDateString() === new Date().toDateString()
  ).length;

  const focusTasks = [...grouped.overdue, ...grouped.today].slice(0, 6);

  return (
    <div className="mx-auto max-w-2xl p-8 space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-medium text-text-3 uppercase tracking-widest mb-1">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 className="text-xl font-semibold text-text">{greeting()}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Overdue"
          value={overdueCount}
          icon={AlertCircle}
          style={{ background: "var(--danger-subtle)", color: "var(--danger)" }}
          href="/tasks"
        />
        <StatCard
          label="Due today"
          value={todayCount}
          icon={CalendarClock}
          style={{ background: "var(--warning-subtle)", color: "var(--warning)" }}
          href="/tasks"
        />
        <StatCard
          label="Done today"
          value={completedToday}
          icon={CheckCircle2}
          style={{ background: "var(--success-subtle)", color: "var(--success)" }}
          href="/tasks"
        />
      </div>

      {/* Focus */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-text-3">
            Focus now
          </h2>
          <Link
            href="/tasks"
            className="flex items-center gap-1 text-[11px] font-medium text-accent hover:text-accent-hover transition-colors"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {focusTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-text-3">All caught up — nothing urgent right now.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface divide-y divide-border px-4">
            {focusTasks.map((task) => (
              <FocusRow key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
