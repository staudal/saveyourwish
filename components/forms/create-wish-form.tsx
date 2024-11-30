"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createWish } from "@/actions/wish";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CurrencySelect } from "@/components/ui/currency-select";
import { CURRENCY_VALUES } from "@/constants";
import toast from "react-hot-toast";
import { useTranslations } from "@/hooks/use-translations";

export function CreateWishForm({
  wishlistId,
  onSuccess,
  onLoadingChange,
}: {
  wishlistId: string;
  onSuccess?: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

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

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      price: undefined,
      currency: "USD",
      imageUrl: "",
      destinationUrl: "",
      description: "",
      quantity: 1,
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);

    await toast.promise(createWish(wishlistId, formSchema.parse(values)), {
      loading: t.wishes.createDialog.loading,
      success: (result) => {
        if (result.success) {
          form.reset();
          router.refresh();
          onSuccess?.();
          return t.wishes.createDialog.success;
        }
        throw new Error(result.error || t.wishes.createDialog.error);
      },
      error: (err) => err.message || t.wishes.createDialog.error,
    });

    setIsLoading(false);
  }

  return (
    <form
      id="create-wish-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid gap-4"
    >
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="title">
            {t.wishes.createDialog.titleField.label}
          </Label>
          {form.formState.errors.title && (
            <span className="text-sm text-red-600 leading-none">
              {form.formState.errors.title.message}
            </span>
          )}
        </div>
        <Input
          {...form.register("title")}
          id="title"
          placeholder={t.wishes.createDialog.titleField.placeholder}
        />
      </div>

      <div className="grid gap-2">
        <div className="flex justify-between w-full items-center">
          <Label htmlFor="price">
            {t.wishes.createDialog.priceField.label}
          </Label>
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
            placeholder={t.wishes.createDialog.priceField.placeholder}
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
            {t.wishes.createDialog.imageUrlField.label}
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
          placeholder={t.wishes.createDialog.imageUrlField.placeholder}
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="destinationUrl">
            {t.wishes.createDialog.destinationUrlField.label}
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
          placeholder={t.wishes.createDialog.destinationUrlField.placeholder}
        />
      </div>

      <div className="grid gap-2">
        <div className="flex justify-between w-full items-center">
          <Label htmlFor="description">
            {t.wishes.createDialog.descriptionField.label}
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
          placeholder={t.wishes.createDialog.descriptionField.placeholder}
        />
      </div>

      <div className="grid gap-2">
        <div className="flex justify-between w-full items-center">
          <Label htmlFor="quantity">
            {t.wishes.createDialog.quantityField.label}
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
          placeholder={t.wishes.createDialog.quantityField.placeholder}
        />
      </div>
    </form>
  );
}
