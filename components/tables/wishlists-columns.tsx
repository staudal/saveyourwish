"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/components/ui/currency-select";
import { calculateAveragePrice, convertToUSD } from "@/lib/utils";
import { useState } from "react";
import { DeleteWishlistDialog } from "../dialogs/delete-wishlist-dialog";
import { Wishlist } from "../wishes/grid/types";
import { ShareWishlistDialog } from "../dialogs/share-wishlist-dialog";
import { WishlistDialog } from "../dialogs/wishlist-dialog";

function WishlistActions({
  wishlist,
  onShareClick,
  onDeleteClick,
}: {
  wishlist: Wishlist;
  onShareClick: () => void;
  onDeleteClick: () => void;
}) {
  const [showEditDialog, setShowEditDialog] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onShareClick();
          }}
        >
          <span className="sr-only">Share</span>
          <Share2 className="h-4 w-4" />
        </Button>
        <WishlistDialog
          mode="edit"
          wishlist={wishlist}
          open={showEditDialog}
          setOpen={setShowEditDialog}
          trigger={
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="sr-only">Edit</span>
              <Pencil className="h-4 w-4" />
            </Button>
          }
        />
        <Button
          variant="outline"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick();
          }}
        >
          <span className="sr-only">Delete</span>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}

function WishlistActionsCell({ row }: { row: Row<Wishlist> }) {
  const wishlist = row.original;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isShared, setIsShared] = useState(wishlist.shared);

  const handleShareChange = (newIsShared: boolean, shareId: string | null) => {
    setIsShared(newIsShared);
    row.original.shared = newIsShared;
    row.original.shareId = shareId;
  };

  return (
    <>
      <div className="flex justify-end">
        <WishlistActions
          wishlist={wishlist}
          onShareClick={() => setShowShareDialog(true)}
          onDeleteClick={() => setShowDeleteDialog(true)}
        />
      </div>

      <ShareWishlistDialog
        wishlistId={wishlist.id}
        isShared={isShared}
        shareId={wishlist.shareId}
        open={showShareDialog}
        setOpen={setShowShareDialog}
        onShareChange={handleShareChange}
      />

      <DeleteWishlistDialog
        id={wishlist.id}
        title={wishlist.title}
        isShared={isShared}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
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
      cell: ({ row }) => <WishlistActionsCell row={row} />,
      enableHiding: false,
    },
  ];

  return columns;
}
