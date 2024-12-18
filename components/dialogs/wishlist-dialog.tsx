"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { WishlistForm } from "../forms/wishlist-form";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Loader2, BadgePlus, RotateCcw, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wishlist } from "../wishlists/schema";

interface WishlistDialogProps {
  mode: "create" | "edit";
  wishlist?: Wishlist;
  trigger?: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export function WishlistDialog({
  mode,
  wishlist,
  trigger,
  open: controlledOpen,
  setOpen: setControlledOpen,
}: WishlistDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const content = (
    <>
      {isDesktop ? (
        <div className="space-y-4">
          <WishlistForm
            mode={mode}
            wishlist={wishlist}
            onSuccess={() => setOpen(false)}
            onLoadingChange={setIsLoading}
          />
        </div>
      ) : (
        <ScrollArea className="h-[60vh]" type="always" scrollHideDelay={0}>
          <div className="px-4 py-4">
            <div className="space-y-4">
              <WishlistForm
                mode={mode}
                wishlist={wishlist}
                onSuccess={() => setOpen(false)}
                onLoadingChange={setIsLoading}
              />
            </div>
          </div>
        </ScrollArea>
      )}
      {isDesktop ? (
        <DialogFooter className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" form="wishlist-form" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "create" ? "Creating..." : "Saving..."}
              </>
            ) : (
              <>
                <BadgePlus className="mr-2 h-4 w-4" />
                {mode === "create" ? "Create" : "Save"}
              </>
            )}
          </Button>
        </DialogFooter>
      ) : (
        <DrawerFooter className="grid grid-cols-2 gap-2 border-t shadow-[0_-2px_4px_rgba(0,0,0,0.025)]">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" form="wishlist-form" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "create" ? "Creating..." : "Saving..."}
              </>
            ) : (
              <>
                <BadgePlus className="mr-2 h-4 w-4" />
                {mode === "create" ? "Create" : "Save"}
              </>
            )}
          </Button>
        </DrawerFooter>
      )}
    </>
  );

  if (!trigger) {
    if (isDesktop) {
      return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {mode === "create" ? "Create wishlist" : "Edit wishlist"}
              </DialogTitle>
              <DialogDescription>
                {mode === "create"
                  ? "Create a new wishlist to track your favorite items"
                  : "Update your wishlist details"}
              </DialogDescription>
            </DialogHeader>
            {content}
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="border-b shadow-[0_2px_4px_rgba(0,0,0,0.025)]">
            <DrawerTitle>
              {mode === "create" ? "Create wishlist" : "Edit wishlist"}
            </DrawerTitle>
            <DrawerDescription>
              {mode === "create"
                ? "Create a new wishlist to track your favorite items"
                : "Update your wishlist details"}
            </DrawerDescription>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Create wishlist" : "Edit wishlist"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Create a new wishlist to track your favorite items"
                : "Update your wishlist details"}
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} repositionInputs={false}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b shadow-[0_2px_4px_rgba(0,0,0,0.025)]">
          <DrawerTitle>
            {mode === "create" ? "Create wishlist" : "Edit wishlist"}
          </DrawerTitle>
          <DrawerDescription>
            {mode === "create"
              ? "Create a new wishlist to track your favorite items"
              : "Update your wishlist details"}
          </DrawerDescription>
        </DrawerHeader>
        {content}
      </DrawerContent>
    </Drawer>
  );
}
