import Link from "next/link";
import { AlertCircle, CalendarClock, CheckCircle2 } from "lucide-react";
import { getTasks } from "@/app/actions/tasks";
import { groupTasks } from "@/lib/priority";
import type { Task } from "@/types";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  href,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accent: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 hover:shadow-sm transition"
    >
      <div className={`rounded-lg p-2.5 ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </Link>
  );
}

function TaskRow({ task }: { task: Task }) {
  const dueLabel = task.due_at
    ? new Date(task.due_at).toLocaleString(undefined, {
        month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit",
      })
    : null;

  return (
    <div className="flex items-center gap-3 py-2">
      <span className="h-2 w-2 rounded-full bg-indigo-400 shrink-0" />
      <span className="flex-1 text-sm text-gray-800 truncate">{task.title}</span>
      {dueLabel && <span className="text-xs text-gray-400 shrink-0">{dueLabel}</span>}
    </div>
  );
}

export default async function DashboardPage() {
  const tasks = await getTasks();
  const grouped = groupTasks(tasks);

  const overdueCount  = grouped.overdue.length;
  const todayCount    = grouped.today.length;
  const completedToday = tasks.filter(
    (t) =>
      t.is_completed &&
      t.completed_at &&
      new Date(t.completed_at).toDateString() === new Date().toDateString()
  ).length;

  const focusTasks = [...grouped.overdue, ...grouped.today].slice(0, 5);

  return (
    <div className="mx-auto max-w-2xl p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Overdue"
          value={overdueCount}
          icon={AlertCircle}
          accent="bg-red-100 text-red-600"
          href="/tasks"
        />
        <StatCard
          label="Due today"
          value={todayCount}
          icon={CalendarClock}
          accent="bg-amber-100 text-amber-600"
          href="/tasks"
        />
        <StatCard
          label="Done today"
          value={completedToday}
          icon={CheckCircle2}
          accent="bg-green-100 text-green-600"
          href="/tasks"
        />
      </div>

      {/* Focus list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Focus now</h2>
          <Link href="/tasks" className="text-xs text-indigo-600 hover:underline">View all</Link>
        </div>

        {focusTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-400">You&apos;re all caught up 🎉</p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 px-4">
            {focusTasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
