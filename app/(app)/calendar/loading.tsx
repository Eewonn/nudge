import { Skeleton } from "@/components/Skeleton";

export default function CalendarLoading() {
  return (
    <div className="flex flex-col">
      {/* Top bar */}
      <div
        className="flex items-center gap-3 px-4 md:px-6 py-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-1">
          <Skeleton className="h-7 w-7" />
          <Skeleton className="h-7 w-14" />
          <Skeleton className="h-7 w-7" />
        </div>
        <Skeleton className="h-6 flex-1 max-w-48" />
        <div className="flex gap-1 ml-auto">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-8 w-16" />
      </div>

      {/* Day headers */}
      <div className="flex" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="w-[52px] shrink-0" />
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex-1 py-3 flex flex-col items-center gap-1">
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="overflow-hidden" style={{ height: "calc(100vh - 160px)" }}>
        <div className="flex h-full">
          {/* Hour labels */}
          <div className="w-[52px] shrink-0 space-y-4 pt-4 px-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-3 w-8 ml-auto" />
            ))}
          </div>
          {/* Grid columns */}
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex-1" style={{ borderLeft: "1px solid var(--border)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
