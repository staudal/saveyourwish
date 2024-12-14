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

  async function handleDelete() {
    setIsLoading(true);

    const result = await deleteWish(id, wishlistId);

    if (result.success) {
      toast.success("Wish deleted successfully");
      router.refresh();
      onOpenChange(false);
    } else {
      toast.error(result.error || "Failed to delete wish");
    }

    setIsLoading(false);
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete wish</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this wish?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
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
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
              isLoading={isLoading}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Delete wish</DrawerTitle>
          <DrawerDescription>
            Are you sure you want to delete this wish?
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="pt-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            isLoading={isLoading}
          >
            Delete
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
