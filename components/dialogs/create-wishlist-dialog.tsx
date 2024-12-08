"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { CreateWishlistForm } from "../forms/create-wishlist-form";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTranslations } from "@/hooks/use-translations";

export function CreateWishlistDialog() {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const t = useTranslations();

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>{t.wishlists.createDialog.trigger}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t.wishlists.createDialog.headline}</DialogTitle>
            <DialogDescription>
              {t.wishlists.createDialog.description}
            </DialogDescription>
          </DialogHeader>
          <CreateWishlistForm
            onSuccess={() => setOpen(false)}
            onLoadingChange={setIsLoading}
          />
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4 w-full">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              {t.wishlists.createDialog.cancel}
            </Button>
            <Button
              className="w-full"
              type="submit"
              form="create-wishlist-form"
              disabled={isLoading}
              isLoading={isLoading}
            >
              {t.wishlists.createDialog.create}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} repositionInputs={false}>
      <DrawerTrigger asChild>
        <Button>{t.wishlists.createDialog.trigger}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t.wishlists.createDialog.headline}</DrawerTitle>
          <DrawerDescription>
            {t.wishlists.createDialog.description}
          </DrawerDescription>
        </DrawerHeader>
        <CreateWishlistForm
          onSuccess={() => setOpen(false)}
          onLoadingChange={setIsLoading}
        />
        <DrawerFooter className="pt-2">
          <Button
            className="w-full"
            type="submit"
            form="create-wishlist-form"
            disabled={isLoading}
            isLoading={isLoading}
          >
            {t.wishlists.createDialog.create}
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            {t.wishlists.createDialog.cancel}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
