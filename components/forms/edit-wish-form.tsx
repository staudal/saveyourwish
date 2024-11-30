"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateWish } from "@/actions/wish";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { type wishes } from "@/lib/db";
import { type InferSelectModel } from "drizzle-orm";
import { CurrencySelect } from "@/components/ui/currency-select";
import { CURRENCY_VALUES } from "@/constants";
import { type Currency } from "@/constants";
import toast from "react-hot-toast";
import { useTranslations } from "@/hooks/use-translations";

type Wish = InferSelectModel<typeof wishes>;

export function EditWishForm({
  wish,
  onSuccess,
  onLoadingChange,
}: {
  wish: Wish;
  onSuccess?: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations();

  type FormData = z.infer<typeof formSchema>;

  const formSchema = z.object({
    title: z
      .string({ message: t.wishes.createDialog.titleField.error })
      .min(2, { message: t.wishes.createDialog.titleField.minLengthError })
      .max(100, {
        message: t.wishes.createDialog.titleField.maxLengthError,
      }),
    price: z
      .number({ message: t.wishes.createDialog.priceField.error })
      .min(0, { message: t.wishes.createDialog.priceField.minLengthError })
      .max(1000000, {
        message: t.wishes.createDialog.priceField.maxLengthError,
      })
      .optional(),
    currency: z.enum(CURRENCY_VALUES).default("USD"),
    imageUrl: z
      .string()
      .url({ message: t.wishes.createDialog.imageUrlField.error })
      .optional()
      .or(z.literal("")),
    destinationUrl: z
      .string()
      .url({ message: t.wishes.createDialog.destinationUrlField.error })
      .optional()
      .or(z.literal("")),
    description: z
      .string()
      .max(1000, {
        message: t.wishes.createDialog.descriptionField.maxLengthError,
      })
      .optional(),
    quantity: z
      .number({ message: t.wishes.createDialog.quantityField.error })
      .min(1, { message: t.wishes.createDialog.quantityField.minLengthError })
      .max(100, { message: t.wishes.createDialog.quantityField.maxLengthError })
      .default(1),
  });

  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: wish.title,
      price: wish.price ?? undefined,
      currency: (wish.currency as Currency) ?? "USD",
      imageUrl: wish.imageUrl ?? "",
      destinationUrl: wish.destinationUrl ?? "",
      description: wish.description ?? "",
      quantity: wish.quantity,
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);

    await toast.promise(
      updateWish(wish.id, wish.wishlistId, formSchema.parse(values)),
      {
        loading: "Updating wish...",
        success: (result) => {
          if (result.success) {
            router.refresh();
            onSuccess?.();
            return t.wishes.editDialog.success;
          }
          throw new Error(result.error || t.wishes.editDialog.error);
        },
        error: (err) => err.message || t.wishes.editDialog.error,
      }
    );

    setIsLoading(false);
  }

  return (
    <form
      id="edit-wish-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid gap-4"
    >
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="title">{t.wishes.editDialog.titleField.label}</Label>
          {form.formState.errors.title && (
            <span className="text-sm text-red-600 leading-none">
              {form.formState.errors.title.message}
            </span>
          )}
        </div>
        <Input
          {...form.register("title")}
          id="title"
          placeholder={t.wishes.editDialog.titleField.placeholder}
        />
      </div>

      <div className="grid gap-2">
        <div className="flex justify-between w-full items-center">
          <Label htmlFor="price">{t.wishes.editDialog.priceField.label}</Label>
          {form.formState.errors.price && (
            <span className="text-sm text-red-600 leading-none">
              {form.formState.errors.price.message}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            {...form.register("price", {
              valueAsNumber: true,
              setValueAs: (v: string) => (v === "" ? undefined : parseFloat(v)),
            })}
            id="price"
            type="number"
            step="0.01"
            placeholder={t.wishes.editDialog.priceField.placeholder}
          />
          <CurrencySelect
            value={form.watch("currency")}
            onValueChange={(value) => form.setValue("currency", value)}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="imageUrl">
            {t.wishes.editDialog.imageUrlField.label}
          </Label>
          {form.formState.errors.imageUrl && (
            <span className="text-sm text-red-600 leading-none">
              {form.formState.errors.imageUrl.message}
            </span>
          )}
        </div>
        <Input
          {...form.register("imageUrl")}
          id="imageUrl"
          placeholder={t.wishes.editDialog.imageUrlField.placeholder}
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="destinationUrl">
            {t.wishes.editDialog.destinationUrlField.label}
          </Label>
          {form.formState.errors.destinationUrl && (
            <span className="text-sm text-red-600 leading-none">
              {form.formState.errors.destinationUrl.message}
            </span>
          )}
        </div>
        <Input
          {...form.register("destinationUrl")}
          id="destinationUrl"
          placeholder={t.wishes.editDialog.destinationUrlField.placeholder}
        />
      </div>

      <div className="grid gap-2">
        <div className="flex justify-between w-full items-center">
          <Label htmlFor="description">
            {t.wishes.editDialog.descriptionField.label}
          </Label>
          {form.formState.errors.description && (
            <span className="text-sm text-red-600 leading-none">
              {form.formState.errors.description.message}
            </span>
          )}
        </div>
        <Textarea
          {...form.register("description")}
          id="description"
          placeholder={t.wishes.editDialog.descriptionField.placeholder}
        />
      </div>

      <div className="grid gap-2">
        <div className="flex justify-between w-full items-center">
          <Label htmlFor="quantity">
            {t.wishes.editDialog.quantityField.label}
          </Label>
          {form.formState.errors.quantity && (
            <span className="text-sm text-red-600 leading-none">
              {form.formState.errors.quantity.message}
            </span>
          )}
        </div>
        <Input
          {...form.register("quantity", {
            valueAsNumber: true,
            min: 1,
          })}
          id="quantity"
          type="number"
          min="1"
          placeholder={t.wishes.editDialog.quantityField.placeholder}
        />
      </div>
    </form>
  );
}
