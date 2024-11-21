"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FavoriteButton } from "@/components/favorite-button";
import { DeleteWishlistDialog } from "@/components/dialogs/delete-wishlist-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import React from "react";
import { type wishlists } from "@/lib/db";
import { type InferSelectModel } from "drizzle-orm";

type Wishlist = InferSelectModel<typeof wishlists>;

export default function WishlistsTable({
  wishlists,
}: {
  wishlists: Wishlist[];
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {wishlists.map((wishlist) => (
          <TableRow key={wishlist.id}>
            <TableCell className="font-medium">{wishlist.title}</TableCell>
            <TableCell>{wishlist.category}</TableCell>
            <TableCell className="flex gap-2">
              <FavoriteButton id={wishlist.id} favorite={wishlist.favorite} />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedId(wishlist.id);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 size={16} />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <DeleteWishlistDialog
        id={selectedId!}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </Table>
  );
}
