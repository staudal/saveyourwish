"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateWish } from "@/actions/wish";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { type wishes } from "@/lib/db";
import { type InferSelectModel } from "drizzle-orm";
import { CurrencySelect } from "@/components/ui/currency-select";
import { CURRENCY_VALUES } from "@/constants";
import { type Currency } from "@/constants";

type Wish = InferSelectModel<typeof wishes>;

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  price: z.number().min(0).optional(),
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
  description: z.string().optional(),
  quantity: z.number().min(1).default(1),
});

type FormData = z.infer<typeof formSchema>;

export function EditWishForm({
  wish,
  onSuccess,
}: {
  wish: Wish;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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
    try {
      setIsLoading(true);
      await updateWish(wish.id, wish.wishlistId, formSchema.parse(values));

      toast({
        title: "Wish updated",
        description: "Your wish has been updated successfully.",
      });
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update wish.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      {/* Same form fields as CreateWishForm */}
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="title">Title</Label>
          {form.formState.errors.title && (
            <span className="text-sm text-red-600">
              {form.formState.errors.title.message}
            </span>
          )}
        </div>
        <Input {...form.register("title")} id="title" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="price">Price</Label>
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
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input {...form.register("imageUrl")} id="imageUrl" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="destinationUrl">Product URL</Label>
        <Input {...form.register("destinationUrl")} id="destinationUrl" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea {...form.register("description")} id="description" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="quantity">Quantity</Label>
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

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
