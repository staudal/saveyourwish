import WishlistsTable from "@/components/tables/wishlists-table";
import { getWishlists } from "@/actions/wishlist";
import type { Wishlist } from "@/components/wishes/grid/types";

export default async function WishlistsPage() {
  const wishlists = await getWishlists();

  return <WishlistsTable wishlists={wishlists as unknown as Wishlist[]} />;
}
