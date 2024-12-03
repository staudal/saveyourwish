"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Package,
  DollarSign,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/components/ui/currency-select";
import { calculateAveragePrice, convertToUSD, Currency } from "@/constants";
import { useTranslations } from "@/hooks/use-translations";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteWishlistDialog } from "../dialogs/delete-wishlist-dialog";
import { EditWishlistDialog } from "../dialogs/edit-wishlist-dialog";

export type Wishlist = {
  id: string;
  title: string;
  favorite: boolean;
  wishCount: number;
  wishes: {
    price: number | null;
    currency: Currency;
  }[];
};

function WishlistActions({ wishlist }: { wishlist: Wishlist }) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const t = useTranslations();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t.wishlists.dataTable.actions}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setShowEditDialog(true);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            {t.wishlists.editDialog.trigger}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t.wishlists.deleteDialog.trigger}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteWishlistDialog
        id={wishlist.id}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
      <EditWishlistDialog
        open={showEditDialog}
        setOpen={setShowEditDialog}
        wishlist={wishlist}
      />
    </>
  );
}

export function useWishlistColumns() {
  const t = useTranslations();

  const columns: ColumnDef<Wishlist>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            {t.wishlists.dataTable.title}
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2 h-8 w-8 p-0"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        const wishCount = row.getValue("wishCount") as number;
        const averagePriceResult = calculateAveragePrice(row.original.wishes);
        const averagePrice = averagePriceResult
          ? formatPrice(averagePriceResult.amount, averagePriceResult.currency)
          : "-";

        return (
          <div className="flex flex-col gap-1">
            <span className="font-semibold">{title}</span>
            <div className="flex gap-3 text-sm text-muted-foreground sm:hidden">
              <span className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                {wishCount} {wishCount === 1 ? "wish" : "wishes"}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {averagePrice}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "wishCount",
      header: ({ column }) => {
        return (
          <div className="flex items-center hidden sm:flex">
            {t.wishlists.dataTable.wishCount}
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2 h-8 w-8 p-0"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const count = row.getValue("wishCount") as number;
        return (
          <div className="hidden sm:block text-muted-foreground">
            {count} {count === 1 ? "wish" : "wishes"}
          </div>
        );
      },
    },
    {
      id: "averagePrice",
      accessorFn: (row) => {
        const result = calculateAveragePrice(row.wishes);
        if (!result) return null;
        // Convert to USD for consistent sorting
        return convertToUSD(result.amount, result.currency);
      },
      header: ({ column }) => {
        return (
          <div className="flex items-center hidden sm:flex">
            {t.wishlists.dataTable.averagePrice}
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2 h-8 w-8 p-0"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const result = calculateAveragePrice(row.original.wishes);
        if (!result)
          return <div className="hidden sm:block text-muted-foreground">-</div>;
        return (
          <div className="hidden sm:block text-muted-foreground">
            {formatPrice(result.amount, result.currency)}
          </div>
        );
      },
      sortingFn: "basic",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <WishlistActions wishlist={row.original} />
        </div>
      ),
      enableHiding: false,
    },
  ];

  return columns;
}
