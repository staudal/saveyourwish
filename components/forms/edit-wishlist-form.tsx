"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { updateWishlist, updateWishlistCoverImage } from "@/actions/wishlist";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useTranslations } from "@/hooks/use-translations";
import { uploadImageToBlob } from "@/lib/blob";
import React from "react";
import Image from "next/image";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export function EditWishlistForm({
  wishlist,
  onSuccess,
  onLoadingChange,
}: {
  wishlist: { id: string; title: string; coverImage?: string | null };
  onSuccess?: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
}) {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    wishlist.coverImage || null
  );
  const t = useTranslations();

  const formSchema = z.object({
    title: z.string().min(2, { message: t.wishlists.editDialog.titleError }),
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: wishlist.title,
    },
  });

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(wishlist.coverImage || null);
    }
  };

  // Cleanup preview URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (previewUrl && previewUrl !== wishlist.coverImage) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, wishlist.coverImage]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    onLoadingChange?.(true);

    try {
      // Update title
      const result = await updateWishlist(wishlist.id, { title: values.title });
      if (!result.success) {
        throw new Error("Failed to update wishlist");
      }

      // Handle cover image update if provided
      if (values.coverImage?.[0]) {
        const file = values.coverImage[0];
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const uploadResult = await uploadImageToBlob(
          {
            name: file.name,
            type: file.type,
            data: Array.from(uint8Array),
          },
          wishlist.id
        );

        if (!uploadResult.success || !uploadResult.url) {
          throw new Error("Failed to upload cover image");
        }

        const updateImageResult = await updateWishlistCoverImage(
          wishlist.id,
          uploadResult.url
        );

        if (!updateImageResult.success) {
          throw new Error("Failed to update wishlist cover image");
        }
      }

      toast.success(t.wishlists.editDialog.success);
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message || t.error);
    } finally {
      onLoadingChange?.(false);
    }
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

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="coverImage">Cover Image</Label>
          {form.formState.errors.coverImage && (
            <span className="text-sm text-red-600 leading-none">
              {form.formState.errors.coverImage.message}
            </span>
          )}
        </div>
        {previewUrl && (
          <div className="relative mb-2 rounded-md overflow-hidden">
            <Image
              src={previewUrl}
              alt="Cover preview"
              className="w-full h-32 object-cover"
            />
          </div>
        )}
        <Input
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          {...form.register("coverImage", {
            onChange: handleFileChange,
          })}
          id="coverImage"
        />
      </div>
    </form>
  );
}
