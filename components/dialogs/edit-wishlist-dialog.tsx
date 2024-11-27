"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { EditWishlistForm } from "../forms/edit-wishlist-form";
import { Wishlist } from "../tables/wishlists-columns";

export function EditWishlistDialog({
  open,
  setOpen,
  wishlist,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  wishlist: Wishlist;
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit wishlist</DialogTitle>
            <DialogDescription>
              Change the title and category of your wishlist.
            </DialogDescription>
          </DialogHeader>
          <EditWishlistForm
            wishlist={wishlist}
            onSuccess={() => setOpen(false)}
            onLoadingChange={setIsLoading}
          />
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="w-full"
              type="submit"
              form="edit-wishlist-form"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <div className="mx-auto w-full">
          <DrawerHeader>
            <DrawerTitle>Edit wishlist</DrawerTitle>
            <DrawerDescription>
              Change the title and category of your wishlist.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <EditWishlistForm
              wishlist={wishlist}
              onSuccess={() => setOpen(false)}
              onLoadingChange={setIsLoading}
            />
          </div>
          <DrawerFooter className="pt-2">
            <Button
              type="submit"
              form="edit-wishlist-form"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
