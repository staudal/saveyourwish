import { Skeleton } from "@/components/ui/skeleton";

export default function WishlistsLoading() {
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-4 w-full">
          <Skeleton className="h-10 w-[140px]" />
          <Skeleton className="h-10 w-[200px]" />
        </div>
      </div>

      <div className="relative w-full">
        <div className="overflow-x-auto border rounded-md">
          <div className="min-w-full divide-y">
            <div className="bg-muted/50">
              <div className="grid grid-cols-4 gap-4 p-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            </div>
            <div className="divide-y">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-4 gap-4 p-4">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-6 w-full" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
