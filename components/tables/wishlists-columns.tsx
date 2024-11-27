"use client";

import { ColumnDef, sortingFns } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Star } from "lucide-react";
import { DeleteWishlistDialog } from "@/components/dialogs/delete-wishlist-dialog";
import { useState } from "react";
import { formatPrice } from "@/components/ui/currency-select";
import { calculateAveragePrice } from "@/constants";
import { type Currency } from "@/constants";
import { EditWishlistDialog } from "@/components/dialogs/edit-wishlist-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FavoriteButton } from "@/components/favorite-button";

type Wishlist = {
  id: string;
  title: string;
  category: string;
  favorite: boolean;
  wishCount: number;
  wishes: {
    price: number | null;
    currency: Currency;
  }[];
};

// Separate component for the actions cell
function WishlistActions({ wishlist }: { wishlist: Wishlist }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="flex justify-end gap-2"
    >
      {/* Mobile dropdown */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem asChild>
              <EditWishlistDialog wishlist={wishlist} />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <FavoriteButton id={wishlist.id} favorite={wishlist.favorite}>
                <Star className="mr-2 h-4 w-4" />
                {wishlist.favorite ? "Unfavorite" : "Favorite"}
              </FavoriteButton>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop buttons */}
      <div className="hidden md:flex gap-2">
        <FavoriteButton id={wishlist.id} favorite={wishlist.favorite} />
        <EditWishlistDialog wishlist={wishlist} />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Delete Dialog */}
      <DeleteWishlistDialog
        id={wishlist.id}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </div>
  );
}

export const columns: ColumnDef<Wishlist>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-1">
          <span className="font-medium">{row.getValue("title")}</span>
        </div>
      );
    },
    sortingFn: sortingFns.alphanumeric,
  },
  {
    accessorKey: "category",
    header: "Category",
    sortingFn: sortingFns.alphanumeric,
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground">
          {row.getValue("category")}
        </span>
      );
    },
  },
  {
    accessorKey: "wishCount",
    header: "Wishes",
    cell: ({ row }) => {
      const count = row.getValue("wishCount") as number;
      return (
        <span className="text-muted-foreground hidden md:table-cell">
          {count} {count === 1 ? "wish" : "wishes"}
        </span>
      );
    },
    sortingFn: sortingFns.basic,
  },
  {
    accessorKey: "averagePrice",
    header: "Average Price",
    cell: ({ row }) => {
      const wishes = row.original.wishes;
      const result = calculateAveragePrice(wishes);

      if (!result) {
        return (
          <span className="text-muted-foreground hidden md:table-cell">-</span>
        );
      }

      return (
        <span className="text-muted-foreground hidden md:table-cell">
          {formatPrice(result.amount, result.currency)}
        </span>
      );
    },
    sortingFn: (rowA, rowB) => {
      const aPrice = calculateAveragePrice(rowA.original.wishes);
      const bPrice = calculateAveragePrice(rowB.original.wishes);

      if (!aPrice && !bPrice) return 0;
      if (!aPrice) return 1;
      if (!bPrice) return -1;

      return aPrice.amount - bPrice.amount;
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <WishlistActions wishlist={row.original} />,
    enableSorting: false,
  },
];
