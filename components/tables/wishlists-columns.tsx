"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/components/ui/currency-select";
import { calculateAveragePrice, convertToUSD } from "@/lib/utils";
import { useState } from "react";
import { DeleteWishlistDialog } from "../dialogs/delete-wishlist-dialog";
import { EditWishlistDialog } from "../dialogs/edit-wishlist-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Wishlist } from "../wishes/grid/types";
import { ShareWishlistDialog } from "../dialogs/share-wishlist-dialog";
import { useMediaQuery } from "@/hooks/use-media-query";

function WishlistActions({ wishlist }: { wishlist: Wishlist }) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <>
      <div className="flex items-center gap-2">
        {isDesktop && (
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
        )}
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
        wishlistId={wishlist.id}
        isShared={wishlist.shared}
        shareId={wishlist.shareId}
        open={showShareDialog}
        setOpen={setShowShareDialog}
      />
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

function WishAvatarGroup({ wishes }: { wishes: Wishlist["wishes"] }) {
  const maxVisibleAvatars = 3;

  return (
    <div className="flex items-center">
      {wishes.length > 0 ? (
        <div className="flex -space-x-4">
          {wishes.slice(0, maxVisibleAvatars).map((wish, index) => (
            <Avatar
              key={index}
              className="border-2 border-background ring-0 h-10 w-10"
              style={{
                zIndex: maxVisibleAvatars - index,
              }}
            >
              <AvatarImage
                src={wish.imageUrl || undefined}
                alt="Wish image"
                className="object-cover"
              />
              <AvatarFallback className="bg-muted">{index + 1}</AvatarFallback>
            </Avatar>
          ))}
          {wishes.length > maxVisibleAvatars && (
            <div className="flex items-center justify-center w-10 h-10 text-xs font-medium text-foreground bg-muted border-2 border-background rounded-full">
              +{wishes.length - maxVisibleAvatars}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center w-10 h-10 text-xs font-medium text-muted-foreground bg-muted/50 border-2 border-background rounded-full">
          0
        </div>
      )}
    </div>
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
            Wish count
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
        return <WishAvatarGroup wishes={row.original.wishes} />;
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
