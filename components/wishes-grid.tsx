"use client";

import { type wishes } from "@/lib/db";
import { type InferSelectModel } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PencilIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { DeleteWishDialog } from "@/components/dialogs/delete-wish-dialog";
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "./ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Wish = InferSelectModel<typeof wishes>;

export function WishesGrid({ wishes }: { wishes: Wish[] }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedWish, setSelectedWish] = React.useState<Wish | null>(null);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wishes.map((wish) => (
          <div key={wish.id} className="flex flex-col h-full">
            <div className="relative">
              <div className="absolute right-2 top-2 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuLabel>Manage wish</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <PencilIcon />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedWish(wish);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2Icon />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {wish.imageUrl && (
                <div className="w-full">
                  <AspectRatio ratio={16 / 9}>
                    <Image
                      src={wish.imageUrl}
                      alt={wish.title}
                      fill
                      className="object-cover rounded-t"
                    />
                  </AspectRatio>
                </div>
              )}
            </div>
            <div className="border rounded-b flex flex-col h-full">
              <div className="p-4">
                <div className="font-bold">{wish.title}</div>
                {wish.description && (
                  <p className="text-muted-foreground text-sm">
                    {wish.description}
                  </p>
                )}
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Quantity: {wish.quantity}
                  </p>
                </div>
              </div>
              <div className="flex-1"></div>
              <Separator orientation="horizontal" />
              <div className="flex justify-between items-center p-4">
                {wish.destinationUrl && (
                  <p className="text-sm text-muted-foreground">
                    {new URL(wish.destinationUrl).host.replace("www.", "")}
                  </p>
                )}
                {wish.price && (
                  <p className="text-sm text-muted-foreground">
                    ${wish.price.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </div>
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
