import WishlistsTable from "@/components/tables/wishlists-table";
import { getWishlists } from "@/actions/wishlist";

export default async function WishlistsPage() {
  const wishlists = await getWishlists();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <WishlistsTable wishlists={wishlists} />
    </div>
  );
}
