import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWishlist, updateWishlistCoverImage } from "@/actions/wishlist";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useTranslations } from "@/hooks/use-translations";
import { uploadImageToBlob } from "@/lib/blob";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

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
    coverImage: z
      .custom<FileList>()
      .optional()
      .refine(
        (files) => !files || files.length === 0 || files.length === 1,
        "One file is required"
      )
      .refine(
        (files) =>
          !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE,
        `Max file size is 4MB`
      )
      .refine(
        (files) =>
          !files ||
          files.length === 0 ||
          ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
        "Only .jpg, .jpeg, .png and .webp formats are supported"
      ),
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

    try {
      // Create wishlist first to get the ID
      const result = await createWishlist(values.title);

      if (!result.success) {
        throw new Error(result.error || "Failed to create wishlist");
      }

      // If there's a cover image and wishlistId, upload it
      if (values.coverImage?.[0] && result.wishlistId) {
        // Convert File to serializable format
        const file = values.coverImage[0];
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const uploadResult = await uploadImageToBlob(
          {
            name: file.name,
            type: file.type,
            data: Array.from(uint8Array), // Convert to regular array for serialization
          },
          result.wishlistId
        );

        if (!uploadResult.success) {
          throw new Error("Failed to upload cover image");
        }

        // Update wishlist with cover image URL
        const updateResult = await updateWishlistCoverImage(
          result.wishlistId,
          uploadResult.url
        );

        if (!updateResult.success) {
          throw new Error("Failed to update wishlist with cover image");
        }
      }

      toast.success(t.wishlists.createDialog.success);
      form.reset();
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message || t.error);
    } finally {
      setIsLoading(false);
    }
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

      <div className="grid gap-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="coverImage">Cover Image</Label>
          {form.formState.errors.coverImage && (
            <p className="text-sm text-red-600 leading-none">
              {form.formState.errors.coverImage?.message}
            </p>
          )}
        </div>
        <Input
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          {...form.register("coverImage")}
          id="coverImage"
        />
      </div>
    </form>
  );
}
