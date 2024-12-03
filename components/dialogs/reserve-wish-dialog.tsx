"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { reserveWish } from "@/actions/wish";
import { DialogHeader, DialogFooter } from "../ui/dialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Wish } from "../wishes/grid/types";

const formSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be less than 50 characters" }),
});

type FormData = z.infer<typeof formSchema>;

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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleReserve = async (values: FormData) => {
    setIsLoading(true);

    await toast.promise(reserveWish(wish.id, values.name), {
      loading: "Reserving wish...",
      success: (result) => {
        if (result.success) {
          form.reset();
          onOpenChange(false);
          return "Wish reserved successfully";
        }
        throw new Error(result.error || "Failed to reserve wish");
      },
      error: (err) => err.message || "Failed to reserve wish",
    });

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reserve this wish</DialogTitle>
          <DialogDescription>
            Enter your name so the wishlist owner knows who reserved it
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleReserve)} className="space-y-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="name">Your name</Label>
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!form.formState.isValid || isLoading}
            >
              {isLoading ? "Reserving..." : "Reserve"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
