"use client";

import { type wishes } from "@/lib/db";
import { type InferSelectModel } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DeleteWishDialog } from "@/components/dialogs/delete-wish-dialog";
import React from "react";

type Wish = InferSelectModel<typeof wishes>;

export function WishesGrid({ wishes }: { wishes: Wish[] }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedWish, setSelectedWish] = React.useState<Wish | null>(null);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wishes.map((wish) => (
          <Card key={wish.id} className="flex flex-col">
            <CardHeader className="flex-1">
              <div className="font-medium text-lg">{wish.title}</div>
              {wish.imageUrl && (
                <div className="relative w-full h-48 mt-2">
                  <Image
                    src={wish.imageUrl}
                    alt={wish.title}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1">
              {wish.description && (
                <p className="text-muted-foreground text-sm">
                  {wish.description}
                </p>
              )}
              <div className="mt-2 space-y-1">
                {wish.price && (
                  <p className="font-medium">${wish.price.toFixed(2)}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Quantity: {wish.quantity}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {wish.destinationUrl && (
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    href={wish.destinationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    View Product
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={() => {
                  setSelectedWish(wish);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 size={16} />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {selectedWish && (
        <DeleteWishDialog
          id={selectedWish.id}
          wishlistId={selectedWish.wishlistId}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      )}
    </>
  );
}
