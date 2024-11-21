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
import { CreateWishlistForm } from "../forms/create-wishlist-form";

export function CreateWishlistDialog() {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New wishlist</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New wishlist</DialogTitle>
          <DialogDescription>
            Name your wishlist and choose a category if you'd like.
          </DialogDescription>
        </DialogHeader>
        <CreateWishlistForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
