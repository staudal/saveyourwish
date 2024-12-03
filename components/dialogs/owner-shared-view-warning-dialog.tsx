"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function OwnerSharedViewWarningDialog({
  open,
  onOpenChange,
  wishlistId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wishlistId: string;
}) {
  const router = useRouter();

  const handleRedirect = () => {
    router.push(`/dashboard/wishlists/${wishlistId}`);
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-background/100 backdrop-blur-sm z-50" />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="z-50">
          <DialogHeader>
            <DialogTitle>Warning: Owner Access</DialogTitle>
            <DialogDescription>
              As the owner of this wishlist, viewing the shared page will show
              you who has reserved your wishes. This might spoil the surprise!
              Would you like to continue to the shared view or go back to your
              dashboard?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant={"outline"} onClick={() => onOpenChange(false)}>
              Continue
            </Button>
            <Button variant={"default"} onClick={handleRedirect}>
              Back to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
