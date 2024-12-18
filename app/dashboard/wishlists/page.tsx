import { Suspense } from "react";
import { getWishlists } from "@/actions/wishlist";
import WishlistsLoading from "./loading";
import { DataTable } from "@/components/wishlists/table";
import { columns } from "@/components/wishlists/columns";
import WishlistHeader from "@/components/wishlists/header";

async function WishlistsContent() {
  const wishlists = await getWishlists();
  return (
    <div className="flex flex-col gap-4">
      <WishlistHeader />
      <DataTable columns={columns} data={wishlists} />
    </div>
  );
}

export default function WishlistsPage() {
  return (
    <Suspense fallback={<WishlistsLoading />}>
      <WishlistsContent />
    </Suspense>
  );
}
