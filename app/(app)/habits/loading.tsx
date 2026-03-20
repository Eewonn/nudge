import { Skeleton } from "@/components/Skeleton";

export default function HabitsLoading() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Habit rows */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 flex-1" />
          <div className="flex gap-1">
            {[...Array(7)].map((_, j) => (
              <Skeleton key={j} className="h-8 w-8 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
