"use client";

import { type Wishlist, useWishlistColumns } from "./wishlists-columns";
import { DataTable } from "@/components/tables/data-table";

export default function WishlistsTable({
  wishlists,
}: {
  wishlists: Wishlist[];
}) {
  const columns = useWishlistColumns();
  return <DataTable columns={columns} data={wishlists} />;
}
