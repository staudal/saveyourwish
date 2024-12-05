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
import { useTranslations } from "@/hooks/use-translations";

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
  const t = useTranslations();

  const formSchema = z.object({
    title: z.string().min(2, { message: t.wishlists.editDialog.titleError }),
  });
  type FormData = z.infer<typeof formSchema>;

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

    const result = await updateWishlist(wishlist.id, values);

    if (result.success) {
      toast.success(t.wishlists.editDialog.success);
      router.refresh();
      onSuccess?.();
    } else {
      toast.error(t.error);
    }

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
          <Label htmlFor="title">{t.wishlists.editDialog.titleLabel}</Label>
          {form.formState.errors.title && (
            <span className="text-sm text-red-600 leading-none">
              {form.formState.errors.title.message}
            </span>
          )}
        </div>
        <Input
          {...form.register("title")}
          id="title"
          placeholder={t.wishlists.editDialog.titlePlaceholder}
        />
      </div>
    </form>
  );
}
