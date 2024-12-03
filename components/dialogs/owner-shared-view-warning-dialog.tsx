"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
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
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleRedirect = () => {
    router.push(`/dashboard/wishlists/${wishlistId}`);
  };

  if (!open) return null;

  const overlay = <div className="fixed inset-0 bg-background z-50" />;

  if (isDesktop) {
    return (
      <>
        {overlay}
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="z-[51]">
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
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Continue to Shared View
              </Button>
              <Button onClick={handleRedirect}>Go to Dashboard</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      {overlay}
      <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
        <DrawerContent className="z-[51]">
          <DrawerHeader>
            <DrawerTitle>Warning: Owner Access</DrawerTitle>
            <DrawerDescription>
              As the owner of this wishlist, viewing the shared page will show
              you who has reserved your wishes. This might spoil the surprise!
              Would you like to continue to the shared view or go back to your
              dashboard?
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button onClick={handleRedirect}>Go to Dashboard</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Continue to Shared View
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
