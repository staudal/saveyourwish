"use client";

import { ColumnDef } from "@tanstack/react-table";
import { FavoriteButton } from "@/components/favorite-button";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { DeleteWishlistDialog } from "@/components/dialogs/delete-wishlist-dialog";
import { useState } from "react";
import { formatPrice } from "@/components/ui/currency-select";
import { calculateAveragePrice } from "@/constants";
import { type Currency } from "@/constants";
import { EditWishlistDialog } from "@/components/dialogs/edit-wishlist-dialog";

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
      className="flex justify-end gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      <FavoriteButton id={wishlist.id} favorite={wishlist.favorite} />
      <EditWishlistDialog wishlist={wishlist} />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowDeleteDialog(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
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
      return <span className="font-medium">{row.getValue("title")}</span>;
    },
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "wishCount",
    header: "Wishes",
    cell: ({ row }) => {
      const count = row.getValue("wishCount") as number;
      return (
        <span className="text-muted-foreground">
          {count} {count === 1 ? "wish" : "wishes"}
        </span>
      );
    },
  },
  {
    accessorKey: "averagePrice",
    header: "Average Price",
    cell: ({ row }) => {
      const wishes = row.original.wishes;
      const result = calculateAveragePrice(wishes);

      if (!result) {
        return <span className="text-muted-foreground">-</span>;
      }

      return (
        <span className="text-muted-foreground">
          {formatPrice(result.amount, result.currency)}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <WishlistActions wishlist={row.original} />,
  },
];
