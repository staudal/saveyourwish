"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createWishlist, updateWishlist } from "@/actions/wishlist";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { uploadImageToBlob } from "@/lib/blob";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnsplashImagePicker } from "@/components/unsplash/image-picker";
import { Button } from "../ui/button";
import { Upload } from "lucide-react";
import { trackDownload } from "@/lib/unsplash";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

interface WishlistFormProps {
  mode: "create" | "edit";
  wishlist?: {
    id: string;
    title: string;
    coverImage?: string | null;
  };
  onSuccess?: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export function WishlistForm({
  mode,
  wishlist,
  onSuccess,
  onLoadingChange,
}: WishlistFormProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    unsplashId?: string;
  } | null>(wishlist?.coverImage ? { url: wishlist.coverImage } : null);
  const [imageTab, setImageTab] = useState<"unsplash" | "upload">("unsplash");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    wishlist?.coverImage || null
  );

  const formSchema = z.object({
    title: z
      .string()
      .min(2, { message: "Title must be at least 2 characters" }),
    coverImage: z
      .custom<FileList>()
      .optional()
      .refine(
        (files) => !files || files.length === 0 || files.length === 1,
        "One file is required"
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
      title: wishlist?.title || "",
    },
  });

  // Handle file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };

        const compressedFile = await imageCompression(file, options);
        setSelectedFile(compressedFile);
        const tempUrl = URL.createObjectURL(compressedFile);
        setPreviewUrl(tempUrl);
        setSelectedImage({ url: tempUrl });
      } catch (error) {
        console.error("Error compressing image:", error);
        toast.error("Failed to compress image");
      }
    }
  };

  // Handle Unsplash image selection
  const handleUnsplashSelect = async (
    imageUrl: string,
    unsplashId: string,
    downloadLocation: string
  ) => {
    setSelectedImage({ url: imageUrl, unsplashId });
    await trackDownload(downloadLocation);
  };

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && !selectedImage?.unsplashId) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, selectedImage]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (onLoadingChange) onLoadingChange(true);

    try {
      let coverImageUrl = selectedImage?.url || null;
      const unsplashId = selectedImage?.unsplashId || null;

      // If it's an uploaded file (not Unsplash)
      if (selectedFile && !selectedImage?.unsplashId) {
        // The file is already compressed from handleFileChange
        const arrayBuffer = await selectedFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const uploadResult = await uploadImageToBlob(
          {
            name: selectedFile.name,
            type: selectedFile.type,
            data: Array.from(uint8Array),
          },
          wishlist?.id || ""
        );

        if (!uploadResult.success || !uploadResult.url) {
          throw new Error("Failed to upload cover image");
        }

        coverImageUrl = uploadResult.url;
      }
      // If it's an Unsplash image, use the URL directly
      else if (selectedImage?.unsplashId) {
        coverImageUrl = selectedImage.url;
      }

      const result =
        mode === "edit" && wishlist
          ? await updateWishlist(wishlist.id, {
              title: data.title,
              coverImage: coverImageUrl,
              unsplashId,
            })
          : await createWishlist({
              title: data.title,
              coverImage: coverImageUrl,
              unsplashId,
            });

      if (!result.success) {
        throw new Error(result.error || `Failed to ${mode} wishlist`);
      }

      toast.success(
        mode === "create"
          ? "Wishlist created successfully!"
          : "Wishlist updated successfully!"
      );
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message || "Something went wrong");
    } finally {
      onLoadingChange?.(false);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedFile(null);
    setPreviewUrl(null);
    setSelectedImage(null);
    if (document.getElementById("coverImage")) {
      (document.getElementById("coverImage") as HTMLInputElement).value = "";
    }
  };

  return (
    <form
      id="wishlist-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="title">Title</Label>
          {form.formState.errors.title && (
            <span className="text-sm text-destructive">
              {form.formState.errors.title.message}
            </span>
          )}
        </div>
        <Input
          {...form.register("title")}
          id="title"
          placeholder="My wishlist"
        />
      </div>

      <div className="space-y-2">
        <Label>Cover Image</Label>
        <div>
          <Tabs
            value={imageTab}
            onValueChange={(v) => setImageTab(v as "unsplash" | "upload")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="unsplash" disabled={!!selectedImage}>
                Unsplash
              </TabsTrigger>
              <TabsTrigger value="upload" disabled={!!selectedImage}>
                Upload
              </TabsTrigger>
            </TabsList>
            <TabsContent value="unsplash">
              <div className={selectedImage ? "pointer-events-auto" : ""}>
                <UnsplashImagePicker
                  onSelect={handleUnsplashSelect}
                  selectedImage={selectedImage}
                  onRemove={() => setSelectedImage(null)}
                />
              </div>
            </TabsContent>
            <TabsContent value="upload">
              <div>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="coverImage"
                    className={`flex flex-col items-center justify-center w-full h-[300px] rounded-lg relative overflow-hidden ${
                      selectedImage
                        ? "cursor-default"
                        : "cursor-pointer hover:bg-muted/50 border-2 border-dashed"
                    }`}
                  >
                    {selectedImage ? (
                      <>
                        <Image
                          src={selectedImage.url}
                          alt="Cover preview"
                          className="object-cover"
                          fill
                        />
                        <div className="absolute top-2 left-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="cursor-default hover:bg-white hover:cursor-default"
                          >
                            Selected image
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={handleRemoveImage}
                        >
                          Remove
                        </Button>
                        {selectedImage.unsplashId && (
                          <div className="absolute bottom-2 right-2">
                            <a
                              href={`https://unsplash.com/?utm_source=saveyourwish&utm_medium=referral`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-white hover:underline bg-black/50 px-2 py-1 rounded-md"
                            >
                              Photo from Unsplash
                            </a>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG or WEBP (MAX. 4MB)
                        </p>
                      </div>
                    )}
                    <Input
                      type="file"
                      accept={ACCEPTED_IMAGE_TYPES.join(",")}
                      {...form.register("coverImage", {
                        onChange: handleFileChange,
                      })}
                      id="coverImage"
                      className="hidden"
                      disabled={!!selectedImage}
                    />
                  </label>
                </div>
                {form.formState.errors.coverImage && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.coverImage.message}
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </form>
  );
}
