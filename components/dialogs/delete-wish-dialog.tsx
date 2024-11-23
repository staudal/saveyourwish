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
import { deleteWish } from "@/actions/wish";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  async function handleDelete() {
    const result = await deleteWish(id, wishlistId);
    if (result.success) {
      toast({
        title: "Wish deleted",
        description: "Your wish has been successfully deleted.",
      });
      router.refresh();
      onOpenChange(false);
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this
            wish.
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
