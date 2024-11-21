import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { WISHLIST_CATEGORIES } from "@/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createWishlist } from "@/actions/wishlist";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Create the Zod enum dynamically based on the categories from constants.ts
const CategoryEnum = z.enum(WISHLIST_CATEGORIES);

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters",
  }),
  category: CategoryEnum,
});

export function CreateWishlistForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: WISHLIST_CATEGORIES[0],
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      await createWishlist(values.title, values.category);
      form.reset();
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid items-start gap-4"
    >
      <div className="grid gap-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="title">Title</Label>
          {form.formState.errors.title && (
            <p className="text-sm text-red-600">
              {form.formState.errors.title?.message}
            </p>
          )}
        </div>
        <Input {...form.register("title")} id="title" />
      </div>

      <div className="grid gap-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="category">Category</Label>
          {form.formState.errors.category && (
            <p className="text-sm text-red-600">
              {form.formState.errors.category?.message}
            </p>
          )}
        </div>
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
          <p>{form.formState.errors.category?.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create"}
      </Button>
    </form>
  );
}
