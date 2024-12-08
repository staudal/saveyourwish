"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { reserveWish } from "@/actions/wish";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Wish } from "../wishes/grid/types";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTranslations } from "@/hooks/use-translations";

export function ReserveWishDialog({
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

  const formSchema = z.object({
    name: z
      .string({ required_error: t.wishes.reserveDialog.nameRequired })
      .min(2, { message: t.wishes.reserveDialog.nameMinLength })
      .max(50, { message: t.wishes.reserveDialog.nameMaxLength }),
  });

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleReserve = async (values: FormData) => {
    setIsLoading(true);
    const result = await reserveWish(wish.id, values.name);

    if (result.success) {
      form.reset();
      onOpenChange(false);
      toast.success(t.wishes.reserveDialog.success);
    } else {
      toast.error(t.error);
    }
    setIsLoading(false);
  };

  const formContent = (
    <form onSubmit={form.handleSubmit(handleReserve)} className="space-y-4">
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="name">{t.wishes.reserveDialog.nameLabel}</Label>
          {form.formState.errors.name && (
            <span className="text-sm text-red-600 leading-none">
              {form.formState.errors.name.message}
            </span>
          )}
        </div>
        <Input
          {...form.register("name")}
          id="name"
          placeholder={t.wishes.reserveDialog.namePlaceholder}
        />
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t.wishes.reserveDialog.headline}</DialogTitle>
            <DialogDescription>
              {t.wishes.reserveDialog.description}
            </DialogDescription>
          </DialogHeader>
          {formContent}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t.wishes.reserveDialog.cancelButton}
            </Button>
            <Button
              className="w-full"
              onClick={form.handleSubmit(handleReserve)}
              disabled={!form.formState.isValid || isLoading}
              isLoading={isLoading}
            >
              {t.wishes.reserveDialog.button}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t.wishes.reserveDialog.headline}</DrawerTitle>
          <DrawerDescription>
            {t.wishes.reserveDialog.description}
          </DrawerDescription>
        </DrawerHeader>
        {formContent}
        <DrawerFooter className="pt-2">
          <Button
            className="w-full"
            onClick={form.handleSubmit(handleReserve)}
            disabled={!form.formState.isValid || isLoading}
            isLoading={isLoading}
          >
            {t.wishes.reserveDialog.button}
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t.wishes.reserveDialog.cancelButton}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
