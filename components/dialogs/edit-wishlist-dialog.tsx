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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateWishlist } from "@/actions/wishlist";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { WISHLIST_CATEGORIES } from "@/constants";
import { useMediaQuery } from "@/hooks/use-media-query";
import toast from "react-hot-toast";

// Create the Zod enum dynamically based on the categories from constants.ts
const CategoryEnum = z.enum(WISHLIST_CATEGORIES);

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  category: CategoryEnum,
});

type FormData = z.infer<typeof formSchema>;

function EditWishlistForm({
  wishlist,
  onSuccess,
  onLoadingChange,
}: {
  wishlist: { id: string; title: string; category: string };
  onSuccess?: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: wishlist.title,
      category: wishlist.category as z.infer<typeof CategoryEnum>,
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);

    await toast.promise(updateWishlist(wishlist.id, values), {
      loading: "Updating wishlist...",
      success: (result) => {
        if (result.success) {
          router.refresh();
          onSuccess?.();
          return "Wishlist updated successfully!";
        }
        throw new Error(result.error || "Failed to update wishlist");
      },
      error: (err) => err.message || "Failed to update wishlist",
    });

    setIsLoading(false);
  }

  return (
    <form
      id="edit-wishlist-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input {...form.register("title")} id="title" />
        {form.formState.errors.title && (
          <span className="text-sm text-red-600">
            {form.formState.errors.title.message}
          </span>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Controller
          control={form.control}
          name="category"
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {WISHLIST_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.category && (
          <span className="text-sm text-red-600">
            {form.formState.errors.category.message}
          </span>
        )}
      </div>
    </form>
  );
}

export function EditWishlistDialog({
  wishlist,
}: {
  wishlist: { id: string; title: string; category: string };
}) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => e.stopPropagation()}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
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
          variant="ghost"
          size="icon"
          onClick={(e) => e.stopPropagation()}
        >
          <Pencil className="h-4 w-4" />
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
}
