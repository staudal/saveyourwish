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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DeleteWishlistDialogProps {
  id: string;
  title: string;
  isShared?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteWishlistDialog({
  id,
  title,
  isShared = false,
  open,
  onOpenChange,
}: DeleteWishlistDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  async function handleDelete() {
    if (isShared) {
      toast.error("Cannot delete a shared wishlist");
      return;
    }

    setIsLoading(true);

    const result = await deleteWishlist(id);

    if (result.success) {
      toast.success("Wishlist deleted successfully");
      router.refresh();
      onOpenChange(false);
    } else {
      toast.error(result.response || "Failed to delete wishlist");
    }

    setIsLoading(false);
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete wishlist</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the wishlist &quot;{title}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {isShared && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>
                This wishlist is shared and cannot be deleted. Unshare the
                wishlist first to delete it.
              </AlertDescription>
            </Alert>
          )}
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
              disabled={isLoading || isShared}
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
          <DrawerTitle>Delete wishlist</DrawerTitle>
          <DrawerDescription>
            Are you sure you want to delete the wishlist &quot;{title}&quot;?
            This action cannot be undone.
          </DrawerDescription>
          {isShared && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This wishlist is shared and cannot be deleted. Unshare the
                wishlist first to delete it.
              </AlertDescription>
            </Alert>
          )}
        </DrawerHeader>
        <DrawerFooter className="pt-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading || isShared}
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
