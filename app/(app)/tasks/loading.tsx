import { Skeleton } from "@/components/Skeleton";

export default function TasksLoading() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Search bar */}
      <Skeleton className="h-10 w-full" />

      {/* Task groups */}
      {[...Array(3)].map((_, g) => (
        <div key={g} className="space-y-2">
          <Skeleton className="h-3 w-20" />
          {[...Array(g === 0 ? 2 : 4)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}
