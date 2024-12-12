"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createWish } from "@/actions/wish";
import { uploadImageToBlob } from "@/lib/blob";
import { useState, forwardRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CurrencySelect } from "@/components/ui/currency-select";
import { CURRENCY_VALUES } from "@/constants";
import toast from "react-hot-toast";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { FormValues, initialFormValues } from "../dialogs/create-wish-dialog";
import React from "react";
import { cn } from "@/lib/utils";
import { UploadCloud, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
    (val) => (val === "" || isNaN(Number(val)) ? undefined : Number(val)),
    z.number().optional()
  ),
});

interface CreateWishFormProps {
  wishlistId: string;
  onSuccess?: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
  values: FormValues;
  onChange: (values: FormValues) => void;
  isManualMode?: boolean;
  availableImages?: string[];
  onImageSelectorOpen?: () => void;
}

interface FormRef {
  reset: (values: FormValues) => void;
  setSelectedFile: (file: File | null) => void;
  setPreviewUrl: (url: string | null) => void;
  setValue: (name: keyof FormValues, value: any) => void;
}

export const CreateWishForm = forwardRef<FormRef, CreateWishFormProps>(
  (props, ref) => {
    const router = useRouter();
    const [_, setIsSaving] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [customQuantity, setCustomQuantity] = useState("");
    const [isImagesExpanded, setIsImagesExpanded] = useState(false);

    const form = useForm({
      resolver: zodResolver(formSchema),
      defaultValues: props.values,
    });

    // Update preview when imageUrl changes
    useEffect(() => {
      const imageUrl = form.watch("imageUrl");
      if (imageUrl && !previewUrl) {
        setPreviewUrl(imageUrl);
      }
    }, [form.watch("imageUrl"), previewUrl]);

    React.useImperativeHandle(ref, () => ({
      reset: (values: FormValues) => {
        form.reset(values);
        setSelectedFile(null);
        setPreviewUrl(values.imageUrl || null);
      },
      setSelectedFile,
      setPreviewUrl,
      setValue: (name: keyof FormValues, value: any) =>
        form.setValue(name, value),
    }));

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

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
      try {
        setIsSaving(true);
        props.onLoadingChange?.(true);

        let imageUrl = data.imageUrl;
        if (selectedFile) {
          const compressResult = await compressImage(selectedFile);
          if (!compressResult.success) {
            toast.error("Failed to process image. Please try a smaller image.");
            return;
          }

          const uploadResult = await uploadImageToBlob(
            {
              name: compressResult.name,
              type: compressResult.type,
              data: compressResult.data,
            },
            props.wishlistId
          );

          if (!uploadResult.success) {
            toast.error("Failed to upload image");
            return;
          }

          imageUrl = uploadResult.url;
        }

        const result = await createWish(props.wishlistId, {
          ...data,
          imageUrl,
          autoUpdatePrice: props.values.autoUpdatePrice,
        });

        if (result.success) {
          form.reset(initialFormValues);
          setCustomQuantity("");
          props.onChange?.(initialFormValues);
          toast.success("Wish created successfully!");
          router.refresh();
          props.onSuccess?.();
        } else {
          toast.error(result.error || "Something went wrong");
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("Failed to create wish. Please try again.");
      } finally {
        setIsSaving(false);
        props.onLoadingChange?.(false);
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

    const handleSelectAvailableImage = (url: string) => {
      form.setValue("imageUrl", url);
      setPreviewUrl(url);
      setSelectedFile(null);
      if (document.getElementById("image-upload")) {
        (document.getElementById("image-upload") as HTMLInputElement).value =
          "";
      }
    };

    const handleRemoveImage = () => {
      setSelectedFile(null);
      setPreviewUrl(null);
      form.setValue("imageUrl", "");
      if (document.getElementById("image-upload")) {
        (document.getElementById("image-upload") as HTMLInputElement).value =
          "";
      }
    };

    return (
      <form
        id="create-wish-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Product URL */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Link to product</Label>
            {form.formState.errors.destinationUrl && (
              <p className="text-sm text-red-500 leading-none">
                {form.formState.errors.destinationUrl.message}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              {...form.register("destinationUrl")}
              placeholder="Paste product URL here"
              className={cn(
                "pr-8",
                form.formState.errors.destinationUrl && "border-red-500",
                props.values.autoUpdatePrice && "bg-muted"
              )}
              disabled={props.values.autoUpdatePrice}
            />
          </div>
          {props.values.autoUpdatePrice && (
            <p className="text-xs text-muted-foreground">
              URL is locked because details were fetched automatically
            </p>
          )}
        </div>

        {/* Image Selection */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label>Image</Label>
            {(props.availableImages?.length ?? 0) > 1 && (
              <span
                className="text-xs text-primary cursor-pointer hover:underline flex items-center"
                onClick={() => setIsImagesExpanded(!isImagesExpanded)}
              >
                {isImagesExpanded ? "Hide other images" : "Show other images"}
                {isImagesExpanded ? (
                  <ChevronUp className="ml-1 h-3 w-3" />
                ) : (
                  <ChevronDown className="ml-1 h-3 w-3" />
                )}
              </span>
            )}
          </div>

          {/* Image Upload/Preview */}
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
                    className="h-8 w-8 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
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
                  <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground mb-1" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload image
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Available Images Carousel */}
          {isImagesExpanded && (props.availableImages?.length ?? 0) > 1 && (
            <div className="w-full mt-2">
              <Carousel className="w-full">
                <CarouselContent>
                  {props.availableImages!.map((url, index) => (
                    <CarouselItem key={index} className="basis-1/3">
                      <div
                        className={cn(
                          "relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2",
                          url === form.watch("imageUrl")
                            ? "border-primary"
                            : "border-transparent"
                        )}
                        onClick={() => handleSelectAvailableImage(url)}
                      >
                        <Image
                          src={url}
                          alt={`Product image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious type="button" className="left-2" />
                <CarouselNext type="button" className="right-2" />
              </Carousel>
            </div>
          )}
          {/* Help Text */}
          <p className="text-xs text-muted-foreground">
            {(props.availableImages?.length ?? 0) > 1
              ? "Multiple product images available. Click above to upload your own or expand to see other options."
              : (props.availableImages?.length ?? 0) === 1
              ? "Product image loaded. Click above to upload your own instead."
              : "Click above to upload an image"}
          </p>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            {...form.register("title")}
            id="title"
            placeholder="Enter a title"
          />
          {form.formState.errors.title && (
            <p className="text-sm text-red-600">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        {/* Price and Currency */}
        <div className="space-y-1.5">
          <Label>Price</Label>
          <div className="flex gap-2">
            <Input
              {...form.register("price", {
                valueAsNumber: true,
                setValueAs: (v: string) =>
                  v === "" || isNaN(parseFloat(v)) ? undefined : parseFloat(v),
              })}
              type="number"
              step="0.01"
              placeholder="0.00"
              className={cn(
                "flex-1",
                form.formState.errors.price && "border-red-500"
              )}
            />
            <CurrencySelect
              value={form.watch("currency") || "USD"}
              onValueChange={(value) => form.setValue("currency", value)}
              className="w-[110px]"
            />
          </div>
          {form.formState.errors.price && (
            <p className="text-sm text-red-500">
              {form.formState.errors.price.message}
            </p>
          )}
        </div>

        {/* Quantity Selector */}
        <div className="space-y-1.5">
          <Label>How many would you like?</Label>
          <div className="grid grid-cols-5 gap-3 w-full">
            {[1, 2, 3, 4].map((num) => (
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

        {/* Collapsible Description */}
        <div className="space-y-1.5">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          >
            <Label className="cursor-pointer">Description (optional)</Label>
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
);

CreateWishForm.displayName = "CreateWishForm";
