"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { removeReservation } from "@/actions/wish";
import { DialogHeader, DialogFooter } from "../ui/dialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Wish } from "../wishes/grid/types";

export function RemoveReservationDialog({
  wish,
  open,
  onOpenChange,
}: {
  wish: Wish;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRemove = async () => {
    setIsLoading(true);

    await toast.promise(removeReservation(wish.id), {
      loading: "Removing reservation...",
      success: (result) => {
        if (result.success) {
          onOpenChange(false);
          return "Reservation removed successfully";
        }
        throw new Error(result.error || "Failed to remove reservation");
      },
      error: (err) => err.message || "Failed to remove reservation",
    });

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove reservation</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this reservation? This will allow
            others to reserve this wish.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRemove}
            disabled={isLoading}
            variant="destructive"
          >
            {isLoading ? "Removing..." : "Remove reservation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
