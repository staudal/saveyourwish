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
import { Wishlist } from "./schema";
import { deleteWishlist } from "@/actions/wishlist";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function DeleteDialog({
  wishlist,
  open,
  setOpen,
}: {
  wishlist: Wishlist;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await deleteWishlist(wishlist.id);
    setLoading(false);

    if (result.success) {
      toast({
        title: "Success",
        description: result.response,
      });
      setOpen(false);
    } else {
      toast({
        title: "Error",
        description: result.response,
        variant: "destructive",
      });
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            This will permanently delete the wishlist{" "}
            <span className="font-bold">{wishlist.title}</span> and all of its
            items.{" "}
            {wishlist.shared && (
              <span className="font-bold text-red-500">
                This wishlist is shared and cannot be deleted.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            type="submit"
            onClick={handleDelete}
            disabled={loading || wishlist.shared}
          >
            {loading ? "Thinking..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
