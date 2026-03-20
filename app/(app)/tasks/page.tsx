import { getTasks } from "@/app/actions/tasks";
import { groupTasks } from "@/lib/priority";
import TaskList from "@/components/TaskList";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = await getTasks();
  const grouped = groupTasks(tasks);
  const completed = tasks.filter((t) => t.is_completed)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());

  return (
    <div className="p-4 md:p-8">
      <TaskList grouped={grouped} completedTasks={completed} />
    </div>
  );
}
