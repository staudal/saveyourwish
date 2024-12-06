import { WishesGrid } from "@/components/wishes/grid/index";
import { getWishes } from "@/actions/wish";
import { getSharedWishlist } from "@/actions/wishlist";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { OwnerSharedViewWarningWrapper } from "@/components/dialogs/owner-shared-view-warning-wrapper";

export default async function SharedWishlistPage({
  params,
}: {
  params: { shareId: string };
}) {
  const session = await auth();
  const wishlist = await getSharedWishlist(params.shareId);

  if (!wishlist) {
    notFound();
  }

  const wishes = await getWishes(wishlist.id, true);
  const isOwner = session?.user?.id === wishlist.userId;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {isOwner && <OwnerSharedViewWarningWrapper wishlistId={wishlist.id} />}
      <WishesGrid
        wishes={wishes}
        wishlistId={wishlist.id}
        readonly={true}
        isShared={true}
        shareId={wishlist.shareId}
        title={wishlist.title}
        coverImage={wishlist.coverImage}
      />
    </div>
  );
}
