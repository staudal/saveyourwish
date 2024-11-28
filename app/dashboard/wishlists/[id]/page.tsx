import { getWishes } from "@/actions/wish";
import { getWishlist } from "@/actions/wishlist";
import { notFound } from "next/navigation";
import { WishesGrid } from "@/components/wishes/grid";

export default async function WishlistPage({
  params,
}: {
  params: { id: string };
}) {
  const [wishlist, wishes] = await Promise.all([
    getWishlist(params.id),
    getWishes(params.id),
  ]);

  if (!wishlist) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <WishesGrid
        wishes={wishes}
        wishlistId={wishlist.id}
        isShared={wishlist.shared}
        shareId={wishlist.shareId}
        title={wishlist.title}
      />
    </div>
  );
}
