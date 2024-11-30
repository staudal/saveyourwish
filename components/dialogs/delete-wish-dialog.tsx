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
import { deleteWish } from "@/actions/wish";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@/hooks/use-media-query";
import React from "react";
import toast from "react-hot-toast";
import { useTranslations } from "@/hooks/use-translations";

interface DeleteWishDialogProps {
  id: string;
  wishlistId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteWishDialog({
  id,
  wishlistId,
  open,
  onOpenChange,
}: DeleteWishDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const t = useTranslations();

  async function handleDelete() {
    setIsLoading(true);

    await toast.promise(deleteWish(id, wishlistId), {
      loading: t.wishes.deleteDialog.loading,
      success: (result) => {
        if (result.success) {
          router.refresh();
          onOpenChange(false);
          return t.wishes.deleteDialog.success;
        }
        throw new Error(result.error || t.wishes.deleteDialog.error);
      },
      error: (err) => err.message || t.wishes.deleteDialog.error,
    });

    setIsLoading(false);
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.wishes.deleteDialog.headline}</DialogTitle>
            <DialogDescription>
              {t.wishes.deleteDialog.description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t.wishes.deleteDialog.cancel}
            </Button>
            <Button
              className="w-full"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading
                ? t.wishes.deleteDialog.loading
                : t.wishes.deleteDialog.delete}
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
            <DrawerTitle>{t.wishes.deleteDialog.headline}</DrawerTitle>
            <DrawerDescription>
              {t.wishes.deleteDialog.description}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="pt-2">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading
                ? t.wishes.deleteDialog.loading
                : t.wishes.deleteDialog.delete}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" disabled={isLoading}>
                {t.wishes.deleteDialog.cancel}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
