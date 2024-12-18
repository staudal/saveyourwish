import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Wishlist Not Found</h2>
      <p>
        The wishlist you&apos;re looking for doesn&apos;t exist or has been
        deleted.
      </p>
      <Button asChild>
        <Link href="/dashboard/wishlists">Return to wishlists</Link>
      </Button>
    </div>
  );
}
