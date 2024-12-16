"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/components/ui/currency-select";
import { calculateAveragePrice, convertToUSD } from "@/lib/utils";
import { useState, useEffect } from "react";
import { DeleteWishlistDialog } from "../dialogs/delete-wishlist-dialog";
import { EditWishlistDialog } from "../dialogs/edit-wishlist-dialog";
import { Wishlist } from "../wishes/grid/types";
import { ShareWishlistDialog } from "../dialogs/share-wishlist-dialog";

function WishlistActions({ wishlist }: { wishlist: Wishlist }) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [currentWishlist, setCurrentWishlist] = useState(wishlist);

  useEffect(() => {
    setCurrentWishlist(wishlist);
  }, [wishlist]);

  const handleShareChange = (isShared: boolean) => {
    setCurrentWishlist((prev) => ({
      ...prev,
      shared: isShared,
      shareId: isShared ? prev.id : null,
    }));
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setShowShareDialog(true);
          }}
        >
          <span className="sr-only">Share</span>
          <Share2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setShowEditDialog(true);
          }}
        >
          <span className="sr-only">Edit</span>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteDialog(true);
          }}
        >
          <span className="sr-only">Delete</span>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <ShareWishlistDialog
        wishlistId={currentWishlist.id}
        isShared={currentWishlist.shared}
        shareId={currentWishlist.shareId}
        open={showShareDialog}
        setOpen={setShowShareDialog}
        onShareChange={handleShareChange}
      />
      <DeleteWishlistDialog
        id={currentWishlist.id}
        title={currentWishlist.title}
        isShared={currentWishlist.shared}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
      <EditWishlistDialog
        open={showEditDialog}
        setOpen={setShowEditDialog}
        wishlist={currentWishlist}
      />
    </>
  );
}

export function useWishlistColumns() {
  const columns: ColumnDef<Wishlist>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            Title
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
        return <span className="font-semibold">{title}</span>;
      },
    },
    {
      accessorKey: "wishCount",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            Wishes
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
        return (
          <span className="text-muted-foreground">
            {row.original.wishes.length}
          </span>
        );
      },
    },
    {
      id: "averagePrice",
      accessorFn: (row) => {
        const result = calculateAveragePrice(
          row.wishes as {
            price: number | null;
            currency: "USD" | "EUR" | "DKK" | "SEK";
          }[]
        );
        if (!result) return null;
        return convertToUSD(result.amount, result.currency);
      },
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            Average price
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
        const result = calculateAveragePrice(
          row.original.wishes as {
            price: number | null;
            currency: "USD" | "EUR" | "DKK" | "SEK";
          }[]
        );
        if (!result) return <span className="text-muted-foreground">-</span>;
        return (
          <span className="text-muted-foreground">
            {formatPrice(result.amount, result.currency)}
          </span>
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
