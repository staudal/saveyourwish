import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-48 mb-1" />
        <Skeleton className="h-5 w-72" />
      </div>
      <Separator />
      <div className="space-y-4">
        <div>
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-5 w-96 mb-4" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}
