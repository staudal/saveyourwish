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

type Wish = InferSelectModel<typeof wishes>;

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  price: z
    .number()
    .min(0, { message: "Price must be positive" })
    .max(1000000, { message: "Cannot exceed 1,000,000" })
    .optional(),
  currency: z.enum(CURRENCY_VALUES).default("USD"),
  imageUrl: z
    .string()
    .url({ message: "Must be a valid URL" })
    .optional()
    .or(z.literal("")),
  destinationUrl: z
    .string()
    .url({ message: "Must be a valid URL" })
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(1000, { message: "Cannot exceed 1,000 characters" })
    .optional(),
  quantity: z
    .number()
    .min(1, { message: "Must be at least 1" })
    .max(100, { message: "Cannot exceed 100" })
    .default(1),
});

type FormData = z.infer<typeof formSchema>;

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
            return "Wish updated successfully!";
          }
          throw new Error(result.error || "Failed to update wish");
        },
        error: (err) => err.message || "Failed to update wish",
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
          <Label htmlFor="title">Title</Label>
          {form.formState.errors.title && (
            <span className="text-sm text-red-600 leading-none">
              {form.formState.errors.title.message}
            </span>
          )}
        </div>
        <Input {...form.register("title")} id="title" />
      </div>

      <div className="grid gap-2">
        <div className="flex justify-between w-full items-center">
          <Label htmlFor="price">Price</Label>
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
          />
          <CurrencySelect
            value={form.watch("currency")}
            onValueChange={(value) => form.setValue("currency", value)}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="imageUrl">Image URL</Label>
          {form.formState.errors.imageUrl && (
            <span className="text-sm text-red-600 leading-none">
              {form.formState.errors.imageUrl.message}
            </span>
          )}
        </div>
        <Input {...form.register("imageUrl")} id="imageUrl" />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="destinationUrl">Product URL</Label>
          {form.formState.errors.destinationUrl && (
            <span className="text-sm text-red-600 leading-none">
              {form.formState.errors.destinationUrl.message}
            </span>
          )}
        </div>
        <Input {...form.register("destinationUrl")} id="destinationUrl" />
      </div>

      <div className="grid gap-2">
        <div className="flex justify-between w-full items-center">
          <Label htmlFor="description">Description</Label>
          {form.formState.errors.description && (
            <span className="text-sm text-red-600 leading-none">
              {form.formState.errors.description.message}
            </span>
          )}
        </div>
        <Textarea {...form.register("description")} id="description" />
      </div>

      <div className="grid gap-2">
        <div className="flex justify-between w-full items-center">
          <Label htmlFor="quantity">Quantity</Label>
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
        />
      </div>
    </form>
  );
}
