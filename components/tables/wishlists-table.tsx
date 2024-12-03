"use client";

import { Wishlist } from "../wishes/grid/types";
import { useWishlistColumns } from "./wishlists-columns";
import { DataTable } from "@/components/tables/data-table";
import { useMediaQuery } from "@/hooks/use-media-query";

export default function WishlistsTable({
  wishlists,
}: {
  wishlists: Wishlist[];
}) {
  const columns = useWishlistColumns();
  const isDesktop = useMediaQuery("(min-width: 640px)");

  const initialColumnVisibility = {
    averagePrice: isDesktop,
  };

  return (
    <DataTable
      columns={columns}
      data={wishlists}
      initialColumnVisibility={initialColumnVisibility}
    />
  );
}
