import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWishlist } from "@/actions/wishlist";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useTranslations } from "@/hooks/use-translations";

export function CreateWishlistForm({
  onSuccess,
  onLoadingChange,
}: {
  onSuccess?: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations();

  const formSchema = z.object({
    title: z.string().min(2, {
      message: t.wishlists.createDialog.titleError,
    }),
  });

  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    await toast.promise(createWishlist(values.title), {
      loading: t.wishlists.createDialog.loading,
      success: (result) => {
        if (result.success) {
          form.reset();
          router.refresh();
          onSuccess?.();
          return t.wishlists.createDialog.success;
        }
        throw new Error(result.error || t.wishlists.createDialog.error);
      },
      error: (err) => err.message || t.wishlists.createDialog.error,
    });

    setIsLoading(false);
  }

  return (
    <form
      id="create-wishlist-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid items-start gap-4"
    >
      <div className="grid gap-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="title">{t.wishlists.createDialog.titleLabel}</Label>
          {form.formState.errors.title && (
            <p className="text-sm text-red-600 leading-none">
              {form.formState.errors.title?.message}
            </p>
          )}
        </div>
        <Input
          {...form.register("title")}
          id="title"
          placeholder={t.wishlists.createDialog.titlePlaceholder}
        />
      </div>
    </form>
  );
}
