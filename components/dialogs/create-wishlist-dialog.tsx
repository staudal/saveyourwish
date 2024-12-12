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
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { CreateWishlistForm } from "../forms/create-wishlist-form";
import { useMediaQuery } from "@/hooks/use-media-query";

export function CreateWishlistDialog() {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Create wishlist</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create wishlist</DialogTitle>
            <DialogDescription>
              Create a new wishlist to track your favorite items.
            </DialogDescription>
          </DialogHeader>
          <CreateWishlistForm
            onSuccess={() => setOpen(false)}
            onLoadingChange={setIsLoading}
          />
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4 w-full">
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
              form="create-wishlist-form"
              disabled={isLoading}
              isLoading={isLoading}
            >
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} repositionInputs={false}>
      <DrawerTrigger asChild>
        <Button>Create wishlist</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create wishlist</DrawerTitle>
          <DrawerDescription>
            Create a new wishlist to track your favorite items.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <CreateWishlistForm
            onSuccess={() => setOpen(false)}
            onLoadingChange={setIsLoading}
          />
        </div>
        <DrawerFooter>
          <Button
            className="w-full"
            type="submit"
            form="create-wishlist-form"
            disabled={isLoading}
            isLoading={isLoading}
          >
            Create
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
