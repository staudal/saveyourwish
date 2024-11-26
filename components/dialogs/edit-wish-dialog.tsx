"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditWishForm } from "../forms/edit-wish-form";
import { type wishes } from "@/lib/db";
import { type InferSelectModel } from "drizzle-orm";

type Wish = InferSelectModel<typeof wishes>;

export function EditWishDialog({
  wish,
  open,
  onOpenChange,
}: {
  wish: Wish;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit wish</DialogTitle>
          <DialogDescription>
            Update the details of your wish.
          </DialogDescription>
        </DialogHeader>
        <EditWishForm wish={wish} onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
