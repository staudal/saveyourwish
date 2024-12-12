import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWishlist, updateWishlistCoverImage } from "@/actions/wishlist";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { uploadImageToBlob } from "@/lib/blob";
import imageCompression from "browser-image-compression";

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

  const formSchema = z.object({
    title: z.string().min(2, {
      message: "Title must be at least 2 characters",
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

      // If there's a cover image and wishlistId, compress and upload it
      if (values.coverImage?.[0] && result.wishlistId) {
        const file = values.coverImage[0];

        // Compress image before upload
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };

        const compressedFile = await imageCompression(file, options);
        const arrayBuffer = await compressedFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const uploadResult = await uploadImageToBlob(
          {
            name: compressedFile.name,
            type: compressedFile.type,
            data: Array.from(uint8Array),
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

      toast.success("Wishlist created successfully!");
      form.reset();
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message || "Something went wrong");
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
          <Label htmlFor="title">Title</Label>
          {form.formState.errors.title && (
            <p className="text-sm text-red-600 leading-none">
              {form.formState.errors.title?.message}
            </p>
          )}
        </div>
        <Input
          {...form.register("title")}
          id="title"
          placeholder="My wishlist"
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
