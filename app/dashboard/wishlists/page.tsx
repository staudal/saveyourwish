import { CreateWishlistDialog } from "@/components/dialogs/create-wishlist-dialog";
import WishlistsTable from "@/components/tables/wishlists-table";
import { getWishlists } from "@/actions/wishlist";

export default async function WishlistsPage() {
  const wishlists = await getWishlists();

  return (
    <div>
      <CreateWishlistDialog />
      <WishlistsTable wishlists={wishlists} />
    </div>
  );
}
