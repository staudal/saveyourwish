"use client";

import { FavoriteButton } from "@/components/favorite-button";
import { DeleteWishlistDialog } from "@/components/dialogs/delete-wishlist-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import React from "react";
import { type wishlists } from "@/lib/db";
import { type InferSelectModel } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

type Wishlist = InferSelectModel<typeof wishlists>;

export default function WishlistsTable({
  wishlists,
}: {
  wishlists: Wishlist[];
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  return (
    <div className="grid gap-4">
      {wishlists.map((wishlist) => (
        <Link key={wishlist.id} href={`/dashboard/wishlists/${wishlist.id}`}>
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex-1">
                <h3 className="font-medium text-lg">{wishlist.title}</h3>
              </div>
              <div className="flex-1 text-center">
                <p className="text-muted-foreground">{wishlist.category}</p>
              </div>
              <div className="flex gap-2 flex-1 justify-end">
                <FavoriteButton id={wishlist.id} favorite={wishlist.favorite} />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedId(wishlist.id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
      <DeleteWishlistDialog
        id={selectedId!}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
}
