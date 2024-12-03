"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/components/ui/currency-select";
import { calculateAveragePrice, convertToUSD } from "@/constants";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Wishlist } from "../wishes/grid/types";

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

function WishAvatarGroup({ wishes }: { wishes: Wishlist["wishes"] }) {
  const visibleAvatars = {
    mobile: 2,
    desktop: 3,
  };

  return (
    <div className="flex items-center">
      {wishes.length > 0 ? (
        <>
          {/* Mobile: Show 2 avatars */}
          <div className="md:hidden flex -space-x-4">
            {wishes.slice(0, visibleAvatars.mobile).map((wish, index) => (
              <Avatar
                key={index}
                className="border-2 border-background ring-0 h-10 w-10"
                style={{
                  zIndex: visibleAvatars.mobile - index,
                }}
              >
                <AvatarImage
                  src={wish.imageUrl || undefined}
                  alt="Wish image"
                  className="object-cover"
                />
                <AvatarFallback className="bg-muted">
                  {index + 1}
                </AvatarFallback>
              </Avatar>
            ))}
            {wishes.length > visibleAvatars.mobile && (
              <div className="flex items-center justify-center w-10 h-10 text-xs font-medium text-foreground bg-muted border-2 border-background rounded-full">
                +{wishes.length - visibleAvatars.mobile}
              </div>
            )}
          </div>

          {/* Desktop: Show 3 avatars */}
          <div className="hidden md:flex -space-x-4">
            {wishes.slice(0, visibleAvatars.desktop).map((wish, index) => (
              <Avatar
                key={index}
                className="border-2 border-background ring-0 h-10 w-10"
                style={{
                  zIndex: visibleAvatars.desktop - index,
                }}
              >
                <AvatarImage
                  src={wish.imageUrl || undefined}
                  alt="Wish image"
                  className="object-cover"
                />
                <AvatarFallback className="bg-muted">
                  {index + 1}
                </AvatarFallback>
              </Avatar>
            ))}
            {wishes.length > visibleAvatars.desktop && (
              <div className="flex items-center justify-center w-10 h-10 text-xs font-medium text-foreground bg-muted border-2 border-background rounded-full">
                +{wishes.length - visibleAvatars.desktop}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center w-10 h-10 text-xs font-medium text-muted-foreground bg-muted/50 border-2 border-background rounded-full">
          0
        </div>
      )}
    </div>
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
        const result = calculateAveragePrice(
          row.original.wishes as {
            price: number | null;
            currency: "USD" | "EUR" | "DKK" | "SEK";
          }[]
        );

        return (
          <div className="flex flex-col gap-1">
            <span className="font-semibold">{title}</span>
            <div className="md:hidden text-sm text-muted-foreground flex items-center gap-1">
              <span>{t.wishlists.dataTable.averagePriceShort}</span>
              {result ? (
                formatPrice(result.amount, result.currency)
              ) : (
                <span>-</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "wishCount",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
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
        return (
          <div className="flex flex-col gap-2">
            <WishAvatarGroup wishes={row.original.wishes} />
          </div>
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
          <div className="hidden sm:flex items-center">
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
        const result = calculateAveragePrice(
          row.original.wishes as {
            price: number | null;
            currency: "USD" | "EUR" | "DKK" | "SEK";
          }[]
        );
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
