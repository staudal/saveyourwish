"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Pencil } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { EditWishlistForm } from "../forms/edit-wishlist-form";

export const EditWishlistDialog = React.forwardRef<
  HTMLButtonElement,
  {
    wishlist: { id: string; title: string; category: string };
    className?: string;
  }
>(({ wishlist }, ref) => {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit wishlist</DialogTitle>
            <DialogDescription>
              Change the title and category of your wishlist.
            </DialogDescription>
          </DialogHeader>
          <EditWishlistForm
            wishlist={wishlist}
            onSuccess={() => setOpen(false)}
            onLoadingChange={setIsLoading}
          />
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="w-full"
              type="submit"
              form="edit-wishlist-form"
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
      <DrawerTrigger asChild>
        <Button
          ref={ref}
          variant="ghost"
          className="w-full justify-start relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full">
          <DrawerHeader>
            <DrawerTitle>Edit wishlist</DrawerTitle>
            <DrawerDescription>
              Change the title and category of your wishlist.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <EditWishlistForm
              wishlist={wishlist}
              onSuccess={() => setOpen(false)}
              onLoadingChange={setIsLoading}
            />
          </div>
          <DrawerFooter className="pt-2">
            <Button
              type="submit"
              form="edit-wishlist-form"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save changes"}
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
});

EditWishlistDialog.displayName = "EditWishlistDialog";
