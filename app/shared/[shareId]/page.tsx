import { WishesGrid } from "@/components/wishes/grid/index";
import { getWishes } from "@/actions/wish";
import { getSharedWishlist } from "@/actions/wishlist";
import { notFound } from "next/navigation";

export default async function SharedWishlistPage({
  params,
}: {
  params: { shareId: string };
}) {
  const wishlist = await getSharedWishlist(params.shareId);
  if (!wishlist) {
    notFound();
  }

  const wishes = await getWishes(wishlist.id, true);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <WishesGrid
        wishes={wishes}
        wishlistId={wishlist.id}
        readonly
        isShared={wishlist.shared}
        shareId={wishlist.shareId}
        title={wishlist.title}
      />
    </div>
  );
}
