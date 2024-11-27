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
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { WISHLIST_CATEGORIES } from "@/constants";

// Create the Zod enum dynamically based on the categories from constants.ts
const CategoryEnum = z.enum(WISHLIST_CATEGORIES);

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  category: CategoryEnum,
});

type FormData = z.infer<typeof formSchema>;

export function EditWishlistDialog({
  wishlist,
}: {
  wishlist: { id: string; title: string; category: string };
}) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: wishlist.title,
      category: wishlist.category as z.infer<typeof CategoryEnum>,
    },
  });

  async function onSubmit(values: FormData) {
    const result = await updateWishlist(wishlist.id, values);

    if (result.success) {
      toast({
        title: "Wishlist updated",
        description: "Your wishlist has been updated successfully.",
      });
      router.refresh();
      setOpen(false);
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  }

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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
          <Button type="submit">Save changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
