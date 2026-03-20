import { Skeleton } from "@/components/Skeleton";

export default function ReviewLoading() {
  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>

      {/* Review form */}
      <Skeleton className="h-48 w-full" />

      {/* Past reviews */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}
