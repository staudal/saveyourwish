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
import { CreateWishForm } from "../forms/create-wish-form";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTranslations } from "@/hooks/use-translations";

interface CreateWishDialogProps {
  wishlistId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function CreateWishDialog({
  wishlistId,
  open,
  setOpen,
}: CreateWishDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const t = useTranslations();

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t.wishes.createDialog.headline}</DialogTitle>
            <DialogDescription>
              {t.wishes.createDialog.description}
            </DialogDescription>
          </DialogHeader>
          <CreateWishForm
            wishlistId={wishlistId}
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
              {t.wishes.createDialog.cancel}
            </Button>
            <Button
              className="w-full"
              type="submit"
              form="create-wish-form"
              disabled={isLoading}
              isLoading={isLoading}
            >
              {t.wishes.createDialog.create}
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
            <DrawerTitle>{t.wishes.createDialog.headline}</DrawerTitle>
            <DrawerDescription>
              {t.wishes.createDialog.description}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <CreateWishForm
              wishlistId={wishlistId}
              onSuccess={() => setOpen(false)}
              onLoadingChange={setIsLoading}
            />
          </div>
          <DrawerFooter className="pt-2">
            <Button
              type="submit"
              form="create-wish-form"
              disabled={isLoading}
              isLoading={isLoading}
            >
              {t.wishes.createDialog.create}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" disabled={isLoading}>
                {t.wishes.createDialog.cancel}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
