"use client";

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
import { Button } from "@/components/ui/button";
import { deleteWishlist } from "@/actions/wishlist";
import { useRouter } from "next/navigation";
import React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import toast from "react-hot-toast";
import { useTranslations } from "@/hooks/use-translations";

interface DeleteWishlistDialogProps {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteWishlistDialog({
  id,
  open,
  onOpenChange,
}: DeleteWishlistDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const t = useTranslations();

  async function handleDelete() {
    setIsLoading(true);

    await toast.promise(deleteWishlist(id), {
      loading: t.wishlists.deleteDialog.loading,
      success: (result) => {
        if (result.success) {
          router.refresh();
          onOpenChange(false);
          return t.wishlists.deleteDialog.success;
        }
        throw new Error(result.error || t.wishlists.deleteDialog.error);
      },
      error: (err) => err.message || t.wishlists.deleteDialog.error,
    });

    setIsLoading(false);
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.wishlists.deleteDialog.headline}</DialogTitle>
            <DialogDescription>
              {t.wishlists.deleteDialog.description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t.wishlists.deleteDialog.cancel}
            </Button>
            <Button
              className="w-full"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading
                ? t.wishlists.deleteDialog.loading
                : t.wishlists.deleteDialog.delete}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full">
          <DrawerHeader>
            <DrawerTitle>{t.wishlists.deleteDialog.headline}</DrawerTitle>
            <DrawerDescription>
              {t.wishlists.deleteDialog.description}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="pt-2">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading
                ? t.wishlists.deleteDialog.loading
                : t.wishlists.deleteDialog.delete}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" disabled={isLoading}>
                {t.wishlists.deleteDialog.cancel}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
