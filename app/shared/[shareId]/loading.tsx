import { Skeleton } from "@/components/ui/skeleton";

export default function SharedWishlistLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="w-full h-[200px] md:h-[300px] relative rounded-lg overflow-hidden border border-border">
          <Skeleton className="w-full h-full" />
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <Skeleton className="h-8 w-[200px]" />
            {/* No action buttons in shared view */}
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="group relative rounded-lg border overflow-hidden bg-background"
            >
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-4 w-1/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
