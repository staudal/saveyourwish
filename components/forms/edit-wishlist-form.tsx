"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { updateWishlist } from "@/actions/wishlist";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
});

type FormData = z.infer<typeof formSchema>;

export function EditWishlistForm({
  wishlist,
  onSuccess,
  onLoadingChange,
}: {
  wishlist: { id: string; title: string };
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
      className="grid gap-4"
    >
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="title">Title</Label>
          {form.formState.errors.title && (
            <span className="text-sm text-red-600 leading-none">
              {form.formState.errors.title.message}
            </span>
          )}
        </div>
        <Input {...form.register("title")} id="title" />
      </div>
    </form>
  );
}
