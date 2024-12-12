"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CurrencySelect } from "@/components/ui/currency-select";
import { Currency, CURRENCY_VALUES } from "@/constants";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GalleryHorizontalEnd, UploadCloud, X } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import imageCompression from "browser-image-compression";
import { getUrlMetadata } from "@/actions/wish";
import toast from "react-hot-toast";

export const formSchema = z.object({
  title: z.string().min(2, "Must be at least 2 characters").max(100),
  price: z.preprocess(
    (val) => (val === "" || isNaN(Number(val)) ? undefined : Number(val)),
    z.number().min(0.01, "Price must be at least 0.01").optional()
  ),
  currency: z.enum(CURRENCY_VALUES),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  destinationUrl: z.string().url("Must be a valid URL"),
  description: z.string().max(1000).optional(),
  quantity: z.preprocess(
    (val) => (val === "" || isNaN(Number(val)) ? 1 : Number(val)),
    z.number().min(1).max(100)
  ),
  autoUpdatePrice: z.boolean().default(false),
});

export type FormValues = z.infer<typeof formSchema>;

interface WishFormProps {
  form: UseFormReturn<FormValues>;
  mode: "create" | "edit";
  onSubmit: (data: FormValues) => Promise<void>;
  availableImages?: string[];
  onFileSelect?: (file: File | null) => void;
  resetPreviewRef?: React.MutableRefObject<(() => void) | undefined>;
  isLoadingImages?: boolean;
}

export function WishForm({
  form,
  mode,
  onSubmit,
  onFileSelect,
  resetPreviewRef,
  availableImages,
}: WishFormProps) {
  const validateUrl = (value: string | undefined) => {
    if (!value) return false;
    try {
      const url = new URL(value);
      return (
        (url.protocol === "http:" || url.protocol === "https:") &&
        url.hostname.includes(".")
      );
    } catch {
      return false;
    }
  };

  const [isImagesExpanded, setIsImagesExpanded] = React.useState(false);
  const [localIsLoadingImages, setLocalIsLoadingImages] = React.useState(false);
  const [localAvailableImages, setLocalAvailableImages] = React.useState<
    string[]
  >([]);

  const [isPriceSyncing, setIsPriceSyncing] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(
    !!form.getValues("description")
  );
  const [customQuantity, setCustomQuantity] = React.useState("");

  React.useEffect(() => {
    setPreviewUrl(form.getValues("imageUrl") || null);
  }, [form]);

  React.useEffect(() => {
    const quantity = form.watch("quantity");
    if (quantity > 4) {
      setCustomQuantity(quantity.toString());
    }
  }, [form]);

  React.useEffect(() => {
    if (resetPreviewRef) {
      resetPreviewRef.current = () => {
        setPreviewUrl(form.getValues("imageUrl") || null);
        setSelectedFile(null);
      };
    }
  }, [resetPreviewRef, form]);

  React.useEffect(() => {
    if (availableImages?.length) {
      setLocalAvailableImages(availableImages);
    }
  }, [availableImages]);

  React.useEffect(() => {
    const destinationUrl = form.watch("destinationUrl");
    if (!destinationUrl) {
      setLocalAvailableImages([]);
      setIsImagesExpanded(false);
    }
  }, [form]);

  React.useEffect(() => {
    const description = form.watch("description");
    if (description) {
      setIsDescriptionExpanded(true);
    }
  }, [form]);

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
        onFileSelect?.(compressedFile);
        const tempUrl = URL.createObjectURL(compressedFile);
        setPreviewUrl(tempUrl);
        form.setValue("imageUrl", tempUrl);
      } catch (error) {
        console.error("Error compressing image:", error);
      }
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    form.setValue("imageUrl", "", { shouldValidate: true });
    if (document.getElementById("image-upload")) {
      (document.getElementById("image-upload") as HTMLInputElement).value = "";
    }
  };

  const handlePriceSync = async () => {
    const url = form.watch("destinationUrl");
    if (!url) return;

    setIsPriceSyncing(true);
    try {
      const result = await getUrlMetadata(url);
      if (result.success && result.data?.price) {
        form.setValue("price", result.data.price);
        if (
          result.data.currency &&
          CURRENCY_VALUES.includes(result.data.currency as Currency)
        ) {
          form.setValue("currency", result.data.currency as Currency);
        }
        form.setValue("autoUpdatePrice", true);
        return true;
      }
      toast.error("Could not enable auto-sync because the URL is invalid");
    } catch (e) {
      toast.error("Failed to sync price");
      console.error(e);
    } finally {
      setIsPriceSyncing(false);
    }
    return false;
  };

  const handleImageExpand = async () => {
    if (!isImagesExpanded && form.watch("destinationUrl")) {
      setIsImagesExpanded(true);
      setLocalIsLoadingImages(true);
      setLocalAvailableImages([]);
      try {
        const result = await getUrlMetadata(form.watch("destinationUrl"));
        if (result.success && result.data?.images?.length) {
          setLocalAvailableImages(result.data.images);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setLocalIsLoadingImages(false);
      }
    } else {
      setIsImagesExpanded(!isImagesExpanded);
    }
  };

  const CarouselSkeleton = () => (
    <Carousel className="w-full">
      <CarouselContent>
        {[1, 2, 3].map((i) => (
          <CarouselItem key={i} className="basis-1/3">
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <div className="w-full h-full bg-muted animate-pulse" />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );

  return (
    <form
      id="wish-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
    >
      {/* Product URL */}
      <div className="flex flex-col space-y-2.5">
        <div className="flex items-center justify-between">
          <Label>Product URL</Label>
          {form.formState.errors.destinationUrl && (
            <p className="text-sm text-destructive leading-none">
              {form.formState.errors.destinationUrl.message}
            </p>
          )}
        </div>
        <Input
          {...form.register("destinationUrl")}
          className={cn(
            form.formState.errors.destinationUrl && "border-destructive",
            form.watch("autoUpdatePrice") && "bg-muted"
          )}
          disabled={form.watch("autoUpdatePrice")}
          placeholder="e.g. https://www.amazon.com/dp/B08N5L5R6Q"
        />
      </div>

      {/* Title */}
      <div className="flex flex-col space-y-2.5">
        <div className="flex items-center justify-between">
          <Label>Title</Label>
          {form.formState.errors.title && (
            <p className="text-sm text-destructive leading-none">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>
        <Input
          {...form.register("title")}
          id="title"
          placeholder="e.g. iPhone 15 Pro Max"
          className={cn(form.formState.errors.title && "border-destructive")}
        />
      </div>

      {/* Image Selection */}
      <div className="space-y-4">
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <Label>Image</Label>
            {form.formState.errors.imageUrl && (
              <p className="text-sm text-destructive leading-none">
                {form.formState.errors.imageUrl.message}
              </p>
            )}
          </div>
          <div className="mt-2.5 rounded-lg border border-border overflow-hidden">
            <div
              onClick={(e) => {
                if (!form.watch("destinationUrl")) {
                  e.stopPropagation();
                  document.getElementById("image-upload")?.click();
                } else {
                  handleImageExpand();
                }
              }}
              className={cn(
                "relative w-full h-24 transition-colors duration-200 ease-in-out",
                "flex items-center justify-center cursor-pointer",
                "hover:bg-muted/50",
                previewUrl ? "bg-muted/20" : ""
              )}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
              />
              {previewUrl ? (
                <div className="relative w-full h-full p-2 flex items-center gap-4">
                  <div className="relative h-full aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground truncate">
                      {selectedFile
                        ? selectedFile.name
                        : previewUrl?.includes("blob.vercel.store")
                        ? "Product image from website"
                        : "Selected image"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {mode === "create" && isImagesExpanded
                        ? "Click to close gallery"
                        : "Click to choose a different image"}
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
                  <GalleryHorizontalEnd className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">
                    {mode === "create" && isImagesExpanded
                      ? "Click to close gallery"
                      : "Click to select an image"}
                  </p>
                </div>
              )}
            </div>
            {isImagesExpanded && form.watch("destinationUrl") && (
              <div className="bg-muted/50 border-t border-border p-4">
                {localIsLoadingImages ? (
                  <CarouselSkeleton />
                ) : localAvailableImages?.length ? (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {localAvailableImages.map((url, index) => (
                        <CarouselItem key={url} className="basis-1/3">
                          <div
                            className={cn(
                              "relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2",
                              form.watch("imageUrl") === url
                                ? "border-primary"
                                : "border-transparent"
                            )}
                            role="button"
                            onClick={() => {
                              form.setValue("imageUrl", url);
                              setPreviewUrl(url);
                              setSelectedFile(null);
                              setLocalAvailableImages(localAvailableImages);
                            }}
                          >
                            <Image
                              src={url}
                              alt={`Product image ${index + 1}`}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                      <CarouselItem className="basis-1/3">
                        <div
                          className="relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 border-dashed border-border hover:border-primary bg-muted/50 hover:bg-muted/70 transition-colors"
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById("image-upload")?.click();
                          }}
                        >
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                            <UploadCloud className="h-6 w-6 text-muted-foreground mb-1" />
                            <p className="text-xs text-muted-foreground">
                              Upload your own
                            </p>
                          </div>
                        </div>
                      </CarouselItem>
                    </CarouselContent>
                    {localAvailableImages.length >= 3 && (
                      <>
                        <CarouselPrevious type="button" />
                        <CarouselNext type="button" />
                      </>
                    )}
                  </Carousel>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      No images found for this URL
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById("image-upload")?.click();
                      }}
                    >
                      <UploadCloud />
                      Upload an image
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Price and Currency */}
      <div className="flex flex-col space-y-2.5">
        <div className="flex justify-between items-center">
          <Label>Price</Label>
          {form.formState.errors.price && (
            <p className="text-sm text-destructive leading-none">
              {form.formState.errors.price.message}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            {...form.register("price")}
            type="number"
            step="0.01"
            placeholder="0.00"
            className={cn(
              form.formState.errors.price && "border-destructive",
              "flex-1"
            )}
            disabled={form.watch("autoUpdatePrice")}
          />
          <CurrencySelect
            value={form.watch("currency") || "USD"}
            onValueChange={(value) => form.setValue("currency", value)}
            className={cn(
              form.formState.errors.currency && "border-destructive",
              "w-[110px]"
            )}
            disabled={form.watch("autoUpdatePrice")}
          />
        </div>
        <span
          className={cn(
            "text-xs font-semibold leading-none",
            validateUrl(form.watch("destinationUrl"))
              ? "text-primary cursor-pointer hover:underline"
              : "text-muted-foreground cursor-not-allowed"
          )}
          onClick={async () => {
            if (!isPriceSyncing && validateUrl(form.watch("destinationUrl"))) {
              if (form.watch("autoUpdatePrice")) {
                form.setValue("autoUpdatePrice", false);
              } else {
                await handlePriceSync();
              }
            }
          }}
        >
          {isPriceSyncing
            ? "Syncing..."
            : form.watch("autoUpdatePrice")
            ? "Switch to manual"
            : "Enable auto-sync"}
        </span>
      </div>

      {/* Quantity Selector */}
      <div className="flex flex-col space-y-2.5">
        <Label>Quantity</Label>
        <div className="grid grid-cols-4 gap-3 w-full">
          {[1, 2, 3].map((num) => (
            <Button
              key={num}
              type="button"
              variant={form.watch("quantity") === num ? "default" : "outline"}
              className="w-full h-9"
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

      {/* Description */}
      <div className="flex flex-col space-y-2.5">
        <div className="flex items-center justify-between">
          <Label
            className="w-full cursor-pointer flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          >
            {isDescriptionExpanded ? "−" : "+"} Want to add more details?
          </Label>
        </div>
        {isDescriptionExpanded && (
          <Textarea
            {...form.register("description")}
            placeholder="Add a description"
            className="min-h-[100px] resize-none"
          />
        )}
      </div>
    </form>
  );
}
