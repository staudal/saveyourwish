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
import { useTranslations } from "@/hooks/use-translations";

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
  const t = useTranslations();

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t.wishlists.editDialog.headline}</DialogTitle>
            <DialogDescription>
              {t.wishlists.editDialog.description}
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
              {t.wishlists.editDialog.cancel}
            </Button>
            <Button
              className="w-full"
              type="submit"
              form="edit-wishlist-form"
              disabled={isLoading}
              isLoading={isLoading}
            >
              {t.wishlists.editDialog.save}
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
            <DrawerTitle>{t.wishlists.editDialog.headline}</DrawerTitle>
            <DrawerDescription>
              {t.wishlists.editDialog.description}
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
              isLoading={isLoading}
            >
              {t.wishlists.editDialog.save}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" disabled={isLoading}>
                {t.wishlists.editDialog.cancel}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
