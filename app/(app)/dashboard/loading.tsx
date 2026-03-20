import { Skeleton } from "@/components/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-12 w-72" />
      </div>

      {/* Quick capture bar */}
      <Skeleton className="h-14 w-full" />

      {/* Bento: completion + streak */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="col-span-2 h-36" />
        <Skeleton className="h-36" />
      </div>

      {/* Focus Now */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>

      {/* Today's schedule + habits row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
