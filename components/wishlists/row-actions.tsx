"use client";

import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { wishlistSchema } from "./schema";
import DeleteDialog from "./delete-dialog";
import { useState } from "react";
import { WishlistDialog } from "../dialogs/wishlist-dialog";

interface RowActionsProps<TData> {
  row: Row<TData>;
}

export function RowActions<TData>({ row }: RowActionsProps<TData>) {
  const wishlist = wishlistSchema.parse(row.original);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openWishlistDialog, setOpenWishlistDialog] = useState(false);
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setOpenWishlistDialog(true);
            }}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setOpenDeleteDialog(true);
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteDialog
        wishlist={wishlist}
        open={openDeleteDialog}
        setOpen={setOpenDeleteDialog}
      />
      <WishlistDialog
        mode="edit"
        wishlist={wishlist}
        open={openWishlistDialog}
        setOpen={setOpenWishlistDialog}
      />
    </div>
  );
}
