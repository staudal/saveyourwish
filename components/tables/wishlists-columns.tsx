"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Star,
  Trash2,
  Package,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPrice } from "@/components/ui/currency-select";
import { calculateAveragePrice, Currency } from "@/constants";
import { EditWishlistDialog } from "@/components/dialogs/edit-wishlist-dialog";
import { DeleteWishlistDialog } from "@/components/dialogs/delete-wishlist-dialog";
import { useState } from "react";
import toast from "react-hot-toast";
import { toggleWishlistFavorite } from "@/actions/wishlist";
import { useRouter } from "next/navigation";

export type Wishlist = {
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

function WishlistActions({ wishlist }: { wishlist: Wishlist }) {
  const router = useRouter();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setShowEditDialog(true);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();

              await toast.promise(toggleWishlistFavorite(wishlist.id), {
                loading: wishlist.favorite
                  ? "Removing from favorites..."
                  : "Adding to favorites...",
                success: (result) => {
                  if (result.success) {
                    router.refresh();
                    return wishlist.favorite
                      ? "Wishlist removed from favorites"
                      : "Wishlist added to favorites";
                  }
                  throw new Error(
                    result.error || "Failed to update favorite status"
                  );
                },
                error: (err) =>
                  err.message || "Failed to update favorite status",
              });
            }}
          >
            <Star className="mr-2 h-4 w-4" />
            {wishlist.favorite ? "Unfavorite" : "Favorite"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
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

export const columns: ColumnDef<Wishlist>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
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
          <span>{title}</span>
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
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hidden sm:flex"
        >
          # of wishes
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hidden sm:flex"
        >
          Average price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
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
  },
  {
    id: "actions",
    cell: ({ row }) => <WishlistActions wishlist={row.original} />,
  },
];
