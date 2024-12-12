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
  DialogFooter,
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

  const formSchema = z.object({
    name: z
      .string({ required_error: "Name is required" })
      .min(2, { message: "Name must be at least 2 characters" })
      .max(50, { message: "Name must be at most 50 characters" }),
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
      toast.success("Wish reserved successfully");
    } else {
      toast.error("Failed to reserve wish");
    }
    setIsLoading(false);
  };

  const formContent = (
    <form onSubmit={form.handleSubmit(handleReserve)}>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="name">Name</Label>
          {form.formState.errors.name && (
            <span className="text-sm text-red-600 leading-none">
              {form.formState.errors.name.message}
            </span>
          )}
        </div>
        <Input
          {...form.register("name")}
          id="name"
          placeholder="Enter your name"
        />
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reserve wish</DialogTitle>
            <DialogDescription>
              Reserve this wish for yourself
            </DialogDescription>
          </DialogHeader>
          {formContent}
          <DialogFooter className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(handleReserve)}
              disabled={!form.formState.isValid || isLoading}
              isLoading={isLoading}
            >
              Reserve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Reserve wish</DrawerTitle>
          <DrawerDescription>Reserve this wish for yourself</DrawerDescription>
        </DrawerHeader>
        <div className="px-4">{formContent}</div>
        <DrawerFooter>
          <Button
            onClick={form.handleSubmit(handleReserve)}
            disabled={!form.formState.isValid || isLoading}
            isLoading={isLoading}
          >
            Reserve
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
