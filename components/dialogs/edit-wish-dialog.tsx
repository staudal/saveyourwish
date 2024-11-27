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

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit wish</DialogTitle>
            <DialogDescription>
              Update the details of your wish.
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
              Cancel
            </Button>
            <Button
              className="w-full"
              type="submit"
              form="edit-wish-form"
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
            <DrawerTitle>Edit wish</DrawerTitle>
            <DrawerDescription>
              Update the details of your wish.
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
            <Button type="submit" form="edit-wish-form" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save wish"}
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
