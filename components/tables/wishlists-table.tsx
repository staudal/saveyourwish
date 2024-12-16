"use client";

import { Wishlist } from "../wishes/grid/types";
import { useWishlistColumns } from "./wishlists-columns";
import { DataTable } from "@/components/tables/data-table";

export default function WishlistsTable({
  wishlists,
}: {
  wishlists: Wishlist[];
}) {
  const columns = useWishlistColumns();

  return (
    <div className="overflow-x-auto">
      <DataTable columns={columns} data={wishlists} />
    </div>
  );
}
