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
    <div className="container mx-auto max-w-screen-lg my-8 px-4 space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">{wishlist.title}</h2>
      <WishesGrid wishes={wishes} readonly wishlist={wishlist} />
    </div>
  );
}
