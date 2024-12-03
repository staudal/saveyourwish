"use client";

import { Wishlist } from "../wishes/grid/types";
import { useWishlistColumns } from "./wishlists-columns";
import { DataTable } from "@/components/tables/data-table";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useEffect, useState } from "react";

export default function WishlistsTable({
  wishlists,
}: {
  wishlists: Wishlist[];
}) {
  const columns = useWishlistColumns();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [columnVisibility, setColumnVisibility] = useState({
    averagePrice: isDesktop,
  });

  useEffect(() => {
    setColumnVisibility({ averagePrice: isDesktop });
  }, [isDesktop]);

  return (
    <DataTable
      columns={columns}
      data={wishlists}
      initialColumnVisibility={columnVisibility}
    />
  );
}
