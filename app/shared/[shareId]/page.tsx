import { WishesGrid } from "@/components/wishes/grid/index";
import { getWishes } from "@/actions/wish";
import { getSharedWishlist } from "@/actions/wishlist";
import { notFound } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {wishlist.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {wishes.length} {wishes.length === 1 ? "wish" : "wishes"}
          </p>
        </div>
        <ThemeToggle />
      </div>
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
