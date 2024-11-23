import { CreateWishDialog } from "@/components/dialogs/create-wish-dialog";
import { WishesGrid } from "@/components/wishes-grid";
import { getWishes } from "@/actions/wish";
import { getWishlist } from "@/actions/wishlist";
import { notFound } from "next/navigation";

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
        <CreateWishDialog wishlistId={params.id} />
      </div>
      <WishesGrid wishes={wishes} />
    </div>
  );
}
