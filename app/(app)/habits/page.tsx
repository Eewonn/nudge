import { getHabits, getHabitLogs } from "@/app/actions/habits";
import HabitItem from "@/components/HabitItem";
import NewHabitButton from "./NewHabitButton";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const [habits, logs] = await Promise.all([getHabits(), getHabitLogs(7)]);

  const active   = habits.filter((h) => h.is_active);
  const archived = habits.filter((h) => !h.is_active);

  function logsFor(habit: (typeof habits)[0]) {
    return logs.filter((l) => l.habit_id === habit.id);
  }

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Habits</h1>
          <p className="text-xs text-text-3 mt-0.5">
            {active.length} active · track your consistency
          </p>
        </div>
        <NewHabitButton />
      </div>

      {/* Active habits */}
      <section className="space-y-2">
        {active.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-sm text-text-3">No habits yet — add one to start tracking.</p>
          </div>
        ) : (
          active.map((habit) => (
            <HabitItem key={habit.id} habit={habit} logs={logsFor(habit)} />
          ))
        )}
      </section>

      {/* Archived */}
      {archived.length > 0 && (
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-text-3 mb-2.5">
            Archived
          </p>
          <div className="space-y-2">
            {archived.map((habit) => (
              <HabitItem key={habit.id} habit={habit} logs={logsFor(habit)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
