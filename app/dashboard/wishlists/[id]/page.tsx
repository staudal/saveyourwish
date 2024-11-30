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
    <WishesGrid
      wishes={wishes}
      wishlistId={wishlist.id}
      isShared={wishlist.shared}
      shareId={wishlist.shareId}
      title={wishlist.title}
    />
  );
}
