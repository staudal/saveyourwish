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
import { EditWishForm } from "../forms/edit-wish-form";
import { type wishes } from "@/lib/db";
import { type InferSelectModel } from "drizzle-orm";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTranslations } from "@/hooks/use-translations";

type Wish = InferSelectModel<typeof wishes>;

export function EditWishDialog({
  wish,
  open,
  setOpen,
  onOpenChange,
}: {
  wish: Wish;
  open: boolean;
  setOpen: (open: boolean) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const t = useTranslations();

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.wishes.editDialog.headline}</DialogTitle>
            <DialogDescription>
              {t.wishes.editDialog.description}
            </DialogDescription>
          </DialogHeader>
          <EditWishForm
            wish={wish}
            onSuccess={() => onOpenChange(false)}
            onLoadingChange={setIsLoading}
          />
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4 w-full">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t.wishes.editDialog.cancel}
            </Button>
            <Button
              className="w-full"
              type="submit"
              form="edit-wish-form"
              disabled={isLoading}
              isLoading={isLoading}
            >
              {t.wishes.editDialog.save}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} repositionInputs={false}>
      <DrawerContent>
        <div className="mx-auto w-full">
          <DrawerHeader>
            <DrawerTitle>{t.wishes.editDialog.headline}</DrawerTitle>
            <DrawerDescription>
              {t.wishes.editDialog.description}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <EditWishForm
              wish={wish}
              onSuccess={() => onOpenChange(false)}
              onLoadingChange={setIsLoading}
            />
          </div>
          <DrawerFooter className="pt-2">
            <Button
              type="submit"
              form="edit-wish-form"
              disabled={isLoading}
              isLoading={isLoading}
            >
              {t.wishes.editDialog.save}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" disabled={isLoading}>
                {t.wishes.editDialog.cancel}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
