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
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import imageCompression from "browser-image-compression";

type Wish = InferSelectModel<typeof wishes>;

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  price: z.preprocess(
    (val) => (val === "" || isNaN(Number(val)) ? undefined : Number(val)),
    z.number().optional()
  ),
  currency: z.enum(CURRENCY_VALUES).optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  destinationUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  description: z.string().max(1000).optional(),
  quantity: z.preprocess(
    (val) => (val === "" || isNaN(Number(val)) ? 1 : Number(val)),
    z.number().min(1).max(100)
  ),
});

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(wish.imageUrl);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [customQuantity, setCustomQuantity] = useState("");

  const form = useForm({
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

  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  const compressImage = async (file: File) => {
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      const buffer = await compressedFile.arrayBuffer();

      return {
        success: true as const,
        data: Array.from(new Uint8Array(buffer)),
        type: compressedFile.type,
        name: compressedFile.name,
      };
    } catch (error) {
      console.error("Compression error:", error);
      return { success: false as const, error: "Failed to compress image" };
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const tempUrl = URL.createObjectURL(file);
      setPreviewUrl(tempUrl);
      form.setValue("imageUrl", "");
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    form.setValue("imageUrl", "");
    if (document.getElementById("image-upload")) {
      (document.getElementById("image-upload") as HTMLInputElement).value = "";
    }
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);

    // Handle image upload if there's a selected file
    if (selectedFile) {
      const compressed = await compressImage(selectedFile);
      if (!compressed.success) {
        toast.error("Failed to process image");
        setIsLoading(false);
        return;
      }
      // TODO: Upload image and get URL
    }

    const result = await updateWish(wish.id, wish.wishlistId, data);

    if (result.success) {
      toast.success("Wish updated successfully");
      router.refresh();
      onSuccess?.();
    } else {
      toast.error(result.error || "Something went wrong");
    }

    setIsLoading(false);
  }

  return (
    <form
      id="edit-wish-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
    >
      {/* Image Selection */}
      <div className="space-y-2">
        <Label>What does it look like?</Label>
        <div className="relative group">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
          />
          <div
            onClick={() => document.getElementById("image-upload")?.click()}
            className={cn(
              "relative w-full h-24 rounded-lg border border-dashed transition-colors duration-200 ease-in-out",
              "flex items-center justify-center cursor-pointer",
              "hover:border-primary hover:bg-muted/50",
              previewUrl ? "border-border bg-muted/20" : "border-border"
            )}
          >
            {previewUrl ? (
              <div className="relative w-full h-full p-2 flex items-center gap-4">
                <div className="relative h-full aspect-square">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain rounded-md"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground truncate">
                    {selectedFile ? selectedFile.name : "Image selected"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click to change image
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 absolute top-2 right-2",
                    "opacity-70 hover:opacity-100 transition-opacity"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <UploadCloud className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">
                  Click to upload image
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">What should we call it?</Label>
        <Input
          {...form.register("title")}
          id="title"
          placeholder="Give your wish a name"
        />
        {form.formState.errors.title && (
          <p className="text-sm text-red-600">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>

      {/* Price and Currency */}
      <div className="space-y-2">
        <Label>How much does it cost?</Label>
        <div className="flex gap-2">
          <Input
            {...form.register("price")}
            type="number"
            step="0.01"
            placeholder="0.00"
            className="flex-1"
          />
          <CurrencySelect
            value={form.watch("currency") || "USD"}
            onValueChange={(value) => form.setValue("currency", value)}
            className="w-[110px]"
          />
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="space-y-2">
        <Label>How many would make you happy?</Label>
        <div className="grid grid-cols-4 gap-3 w-full md:grid-cols-5">
          {[1, 2, 3, 4].map((num, index) => (
            <Button
              key={num}
              type="button"
              variant={form.watch("quantity") === num ? "default" : "outline"}
              className={cn("w-full h-9", index === 3 && "hidden md:block")}
              onClick={() => {
                form.setValue("quantity", num);
                setCustomQuantity("");
              }}
            >
              {num === 1 ? "Just one" : num}
            </Button>
          ))}
          <Input
            type="number"
            min="1"
            placeholder="More?"
            className="w-full h-9"
            value={customQuantity}
            onChange={(e) => {
              const value = e.target.value;
              setCustomQuantity(value);
              const numValue = parseInt(value);
              if (!isNaN(numValue) && numValue > 0) {
                form.setValue("quantity", numValue);
              }
            }}
            onClick={(e) => {
              const input = e.target as HTMLInputElement;
              input.select();
            }}
          />
        </div>
      </div>

      {/* Collapsible Description */}
      <div className="space-y-2">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
        >
          <Label className="cursor-pointer">Want to add more details?</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 hover:bg-transparent"
          >
            {isDescriptionExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        {isDescriptionExpanded && (
          <Textarea
            {...form.register("description")}
            placeholder="Add a description"
            className={cn(
              "min-h-[100px] resize-none",
              form.formState.errors.description && "border-red-500"
            )}
          />
        )}
        {!isDescriptionExpanded && form.watch("description") && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {form.watch("description")}
          </p>
        )}
        {form.formState.errors.description && (
          <p className="text-sm text-red-500">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>
    </form>
  );
}
