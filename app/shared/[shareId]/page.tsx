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
    <div className="container max-w-4xl py-6 space-y-4 mx-auto">
      <h2 className="text-2xl font-bold tracking-tight">{wishlist.title}</h2>
      <WishesGrid wishes={wishes} readonly />
    </div>
  );
}
