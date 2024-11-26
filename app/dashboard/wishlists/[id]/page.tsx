import { CreateWishDialog } from "@/components/dialogs/create-wish-dialog";
import { WishesGrid } from "@/components/wishes/grid/index";
import { getWishes } from "@/actions/wish";
import { getWishlist } from "@/actions/wishlist";
import { notFound } from "next/navigation";
import { ShareWishlistDialog } from "@/components/dialogs/share-wishlist-dialog";

export default async function Page({ params }: { params: { id: string } }) {
  const [wishlist, wishes] = await Promise.all([
    getWishlist(params.id),
    getWishes(params.id),
  ]);

  if (!wishlist) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">{wishlist.title}</h2>
        <div className="flex gap-2">
          <ShareWishlistDialog
            wishlistId={params.id}
            isShared={wishlist.shared}
            shareId={wishlist.shareId}
          />
          <CreateWishDialog wishlistId={params.id} />
        </div>
      </div>
      <WishesGrid wishes={wishes} />
    </div>
  );
}
