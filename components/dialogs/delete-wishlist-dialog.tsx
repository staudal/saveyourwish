"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteWishlist } from "@/actions/wishlist";
import { useRouter } from "next/navigation";
import React from "react";

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

  async function handleDelete() {
    await deleteWishlist(id);
    router.refresh();
    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            wishlist and all items within it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
