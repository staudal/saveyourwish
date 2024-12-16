import { Suspense } from "react";
import { getWishes } from "@/actions/wish";
import { getWishlist } from "@/actions/wishlist";
import { notFound } from "next/navigation";
import { WishesGrid } from "@/components/wishes/grid";
import WishlistLoading from "./loading";

async function WishlistContent({ id }: { id: string }) {
  const [wishlist, wishes] = await Promise.all([
    getWishlist(id),
    getWishes(id),
  ]);

  if (!wishlist) notFound();

  return (
    <WishesGrid
      wishes={wishes}
      wishlistId={wishlist.id}
      isShared={wishlist.shared}
      shareId={wishlist.shareId}
      title={wishlist.title}
      coverImage={wishlist.coverImage}
      unsplashId={wishlist.unsplashId}
    />
  );
}

export default function WishlistPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<WishlistLoading />}>
      <WishlistContent id={params.id} />
    </Suspense>
  );
}
