import WishlistsTable from "@/components/tables/wishlists-table";
import { getWishlists } from "@/actions/wishlist";

export default async function WishlistsPage() {
  const wishlists = await getWishlists();

  return <WishlistsTable wishlists={wishlists} />;
}
