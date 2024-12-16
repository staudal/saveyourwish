import { Suspense } from "react";
import WishlistsTable from "@/components/tables/wishlists-table";
import { getWishlists } from "@/actions/wishlist";
import type { Wishlist } from "@/components/wishes/grid/types";
import WishlistsLoading from "./loading";

async function WishlistsContent() {
  const wishlists = await getWishlists();
  return <WishlistsTable wishlists={wishlists as unknown as Wishlist[]} />;
}

export default function WishlistsPage() {
  return (
    <Suspense fallback={<WishlistsLoading />}>
      <WishlistsContent />
    </Suspense>
  );
}
