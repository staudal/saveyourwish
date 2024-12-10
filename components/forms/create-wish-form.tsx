"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createWish, getUrlMetadata } from "@/actions/wish";
import { useState, useEffect, useMemo, forwardRef } from "react";
import { useRouter } from "next/navigation";
import { CurrencySelect } from "@/components/ui/currency-select";
import { CURRENCY_VALUES } from "@/constants";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { FormValues, initialFormValues } from "../dialogs/create-wish-dialog";
import React from "react";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

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
  autoUpdatePrice: z.boolean().optional(),
});

interface CreateWishFormProps {
  wishlistId: string;
  onSuccess?: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
  values: FormValues;
  onChange: (values: FormValues) => void;
}

interface FormRef {
  reset: (values: FormValues) => void;
}

export const CreateWishForm = forwardRef<FormRef, CreateWishFormProps>(
  ({ wishlistId, onSuccess, onLoadingChange, values, onChange }, ref) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [availableImages, setAvailableImages] = useState<string[]>([]);

    const form = useForm({
      resolver: zodResolver(formSchema),
      defaultValues: values,
    });

    React.useImperativeHandle(ref, () => ({
      reset: (values: FormValues) => form.reset(values),
    }));

    useEffect(() => {
      onLoadingChange?.(isLoading || isFetching);
    }, [isLoading, isFetching, onLoadingChange]);

    const destinationUrl = form.watch("destinationUrl");
    const isValidUrl = useMemo(() => {
      if (!destinationUrl) return false;
      try {
        new URL(destinationUrl);
        return true;
      } catch {
        return false;
      }
    }, [destinationUrl]);

    const handleAutofill = async () => {
      const url = form.getValues("destinationUrl");
      if (!url) {
        form.setError("destinationUrl", { message: "Please enter a URL" });
        return;
      }

      try {
        setIsFetching(true);
        const result = await getUrlMetadata(url);

        if (result.success && result.data) {
          const newValues = { ...values };

          if (result.data.images) {
            setAvailableImages(result.data.images);
            if (result.data.images.length > 0) {
              newValues.imageUrl = result.data.images[0];
            }
          }

          // Update all available fields but don't link the price
          if (result.data.title) newValues.title = result.data.title;
          if (result.data.price) newValues.price = result.data.price;
          if (result.data.currency) {
            newValues.currency =
              (result.data.currency as (typeof CURRENCY_VALUES)[number]) ||
              "USD";
          }
          if (result.data.description)
            newValues.description = result.data.description;
          if (result.data.destinationUrl)
            newValues.destinationUrl = result.data.destinationUrl;

          // Don't set autoUpdatePrice here
          newValues.autoUpdatePrice = false;

          form.reset(newValues);
          onChange(newValues);
          toast.success("Product details filled successfully!");
        } else {
          toast.error("Failed to fetch product details");
        }
      } catch (e) {
        form.setError("destinationUrl", {
          message: "Please enter a valid URL",
        });
      } finally {
        setIsFetching(false);
      }
    };

    const handlePriceLink = async () => {
      const url = form.getValues("destinationUrl");
      if (!url) {
        toast.error("Please enter a valid URL");
        return;
      }

      try {
        setIsFetching(true);
        const result = await getUrlMetadata(url);

        if (
          result.success &&
          result.data &&
          result.data.price &&
          result.data.currency
        ) {
          const newValues = { ...values };

          // Only update price-related fields if both price and currency are present
          newValues.price = result.data.price;
          newValues.currency =
            (result.data.currency as (typeof CURRENCY_VALUES)[number]) || "USD";
          newValues.autoUpdatePrice = true;

          form.reset(newValues);
          onChange(newValues);
          toast.success("Price linked successfully!");
        } else {
          toast.error("No linkable price found on this website");
          onChange({
            ...values,
            autoUpdatePrice: false,
          });
        }
      } catch (e) {
        toast.error("Failed to find a linkable price");
        onChange({
          ...values,
          autoUpdatePrice: false,
        });
      } finally {
        setIsFetching(false);
      }
    };

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
      setIsLoading(true);
      const result = await createWish(wishlistId, {
        ...data,
        autoUpdatePrice: values.autoUpdatePrice,
      });

      if (result.success) {
        toast.success("Wish created successfully!");
        form.reset(initialFormValues);
        onChange(initialFormValues);
        router.refresh();
        onSuccess?.();
      } else {
        toast.error(result.error || "Something went wrong");
      }
      setIsLoading(false);
    };

    useEffect(() => {
      const subscription = form.watch(() => {
        const formValues = form.getValues();
        onChange({
          ...formValues,
          autoUpdatePrice: values.autoUpdatePrice,
          isUrlLocked: values.isUrlLocked,
        });
      });

      return () => subscription.unsubscribe();
    }, [form, onChange, values.autoUpdatePrice, values.isUrlLocked]);

    return (
      <form
        id="create-wish-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4"
      >
        <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
          {/* Left column - main form fields */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="destinationUrl">Product URL</Label>
                {form.formState.errors.destinationUrl && (
                  <span className="text-sm text-red-600 leading-none">
                    {form.formState.errors.destinationUrl.message}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  {...form.register("destinationUrl")}
                  id="destinationUrl"
                  placeholder="e.g. https://www.amazon.com/dp/B08N5L5R6Q"
                  className={
                    values.autoUpdatePrice
                      ? "bg-muted text-muted-foreground"
                      : ""
                  }
                  disabled={values.autoUpdatePrice}
                />
                <Button
                  type="button"
                  onClick={() => handleAutofill()}
                  disabled={isFetching || !isValidUrl}
                >
                  {isFetching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    "Autofill"
                  )}
                </Button>
              </div>
              {isValidUrl && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-update-price"
                    checked={values.autoUpdatePrice}
                    onCheckedChange={async (checked) => {
                      if (checked) {
                        await handlePriceLink();
                      } else {
                        onChange({
                          ...values,
                          autoUpdatePrice: false,
                        });
                      }
                    }}
                  />
                  <Label htmlFor="auto-update-price">
                    Keep price updated with website
                  </Label>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="title">Title (required)</Label>
                {form.formState.errors.title && (
                  <span className="text-sm text-red-600 leading-none">
                    {form.formState.errors.title.message}
                  </span>
                )}
              </div>
              <Input
                {...form.register("title")}
                id="title"
                placeholder="Enter a title"
              />
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
                  value={
                    values.autoUpdatePrice
                      ? values.price?.toString() || ""
                      : undefined
                  }
                  {...(!values.autoUpdatePrice &&
                    form.register("price", {
                      valueAsNumber: true,
                      setValueAs: (v: string) =>
                        v === "" || isNaN(parseFloat(v))
                          ? undefined
                          : parseFloat(v),
                    }))}
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="Enter a price"
                  className={
                    values.autoUpdatePrice
                      ? "bg-muted text-muted-foreground"
                      : ""
                  }
                  disabled={values.autoUpdatePrice}
                />
                <CurrencySelect
                  value={form.watch("currency") || "USD"}
                  onValueChange={(value) => form.setValue("currency", value)}
                  disabled={values.autoUpdatePrice}
                  className={
                    values.autoUpdatePrice
                      ? "bg-muted text-muted-foreground"
                      : ""
                  }
                />
              </div>
              {values.autoUpdatePrice && (
                <div className="bg-muted border p-3 rounded-md flex items-center gap-2 text-sm">
                  <div>
                    <p className="font-medium">Price linked to product URL</p>
                    <p className="text-muted-foreground">
                      Automatically updates when the product price changes
                    </p>
                  </div>
                </div>
              )}
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
              <Textarea
                {...form.register("description")}
                id="description"
                placeholder="Enter a description"
              />
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
                placeholder="Enter quantity"
              />
            </div>
          </div>

          {/* Right column - image preview */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="imageUrl">Image URL</Label>
              {form.formState.errors.imageUrl && (
                <span className="text-sm text-red-600 leading-none">
                  {form.formState.errors.imageUrl.message}
                </span>
              )}
            </div>
            <Input
              {...form.register("imageUrl")}
              id="imageUrl"
              placeholder="Enter an image URL"
            />
            {availableImages.length > 0 ? (
              <div className="grid gap-2">
                <Label>Product Images</Label>
                <Carousel
                  className="w-full"
                  opts={{
                    loop: true,
                  }}
                  setApi={(api) => {
                    if (!api) return;

                    // Set initial image only if different
                    const currentIndex = api.selectedScrollSnap();
                    const currentImage = availableImages[currentIndex];
                    if (
                      currentImage &&
                      currentImage !== form.getValues("imageUrl")
                    ) {
                      form.setValue("imageUrl", currentImage, {
                        shouldDirty: false,
                      });
                    }

                    // Set up the select handler
                    const onSelect = () => {
                      const index = api.selectedScrollSnap();
                      const image = availableImages[index];
                      if (image && image !== form.getValues("imageUrl")) {
                        form.setValue("imageUrl", image, {
                          shouldDirty: false,
                        });
                      }
                    };

                    api.on("select", onSelect);
                    return () => api.off("select", onSelect);
                  }}
                >
                  <CarouselContent>
                    {availableImages.map((imageUrl, index) => (
                      <CarouselItem key={index}>
                        <Card>
                          <CardContent className="relative aspect-square p-1">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Image
                                src={imageUrl}
                                alt={`Product image ${index + 1}`}
                                fill
                                className="object-contain"
                                onError={() => {
                                  console.error(
                                    `Failed to load image: ${imageUrl}`
                                  );
                                  setAvailableImages((current) =>
                                    current.filter((url) => url !== imageUrl)
                                  );
                                }}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious type="button" />
                  <CarouselNext type="button" />
                </Carousel>
                <div className="text-sm text-muted-foreground text-center">
                  {`Image ${
                    form.watch("imageUrl")
                      ? availableImages.indexOf(form.watch("imageUrl")!) + 1
                      : 1
                  } of ${availableImages.length}`}
                </div>
              </div>
            ) : form.watch("imageUrl") ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={form.watch("imageUrl")}
                  alt="Product preview"
                  fill
                  className="object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-image.png";
                  }}
                />
              </div>
            ) : null}
          </div>
        </div>
      </form>
    );
  }
);

CreateWishForm.displayName = "CreateWishForm";
