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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "../ui/drawer";
import { Button } from "../ui/button";
import { Wish } from "../wishes/grid/types";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTranslations } from "@/hooks/use-translations";
import { Loader2 } from "lucide-react";

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
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const t = useTranslations();

  const handleRemove = async () => {
    setIsLoading(true);

    const result = await removeReservation(wish.id);

    if (result.success) {
      toast.success(t.wishes.removeReservationDialog.success);
      onOpenChange(false);
    } else {
      toast.error(t.error);
    }

    setIsLoading(false);
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t.wishes.removeReservationDialog.headline}
            </DialogTitle>
            <DialogDescription>
              {t.wishes.removeReservationDialog.description}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t.wishes.removeReservationDialog.cancelButton}
            </Button>
            <Button
              onClick={handleRemove}
              disabled={isLoading}
              variant="destructive"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? t.loading : t.wishes.removeReservationDialog.button}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t.wishes.removeReservationDialog.headline}</DrawerTitle>
          <DrawerDescription>
            {t.wishes.removeReservationDialog.description}
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button
            onClick={handleRemove}
            disabled={isLoading}
            variant="destructive"
            isLoading={isLoading}
          >
            {t.wishes.removeReservationDialog.button}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t.wishes.removeReservationDialog.cancelButton}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
