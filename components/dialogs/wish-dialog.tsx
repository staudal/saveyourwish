"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { WishForm, type FormValues, formSchema } from "../forms/wish-form";
import { useMediaQuery } from "@/hooks/use-media-query";
import { type wishes } from "@/lib/db";
import { type InferSelectModel } from "drizzle-orm";
import { Loader2, Brain, BrickWall, BadgePlus, RotateCcw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createWish,
  updateWish,
  getUrlMetadata,
  fetchAndUploadImage,
} from "@/actions/wish";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { CURRENCIES } from "@/constants";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadImageToBlob } from "@/lib/blob";
import { cn } from "@/lib/utils";

type Wish = InferSelectModel<typeof wishes>;

const initialFormValues: FormValues = {
  title: "",
  price: undefined,
  currency: "USD",
  imageUrl: "",
  destinationUrl: "",
  description: "",
  quantity: 1,
  autoUpdatePrice: false,
};

interface WishDialogProps {
  mode: "create" | "edit";
  open: boolean;
  setOpen: (open: boolean) => void;
  wish?: Wish;
  wishlistId: string;
}

export function WishDialog({
  mode,
  open,
  setOpen,
  wish,
  wishlistId,
}: WishDialogProps) {
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isLoading, setIsLoading] = React.useState(false);
  const [step, setStep] = React.useState<"url" | "form">(
    mode === "create" ? "url" : "form"
  );
  const [url, setUrl] = React.useState("");
  const [isValidUrl, setIsValidUrl] = React.useState(false);
  const [availableImages, setAvailableImages] = React.useState<string[]>([]);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isLoadingImages, setIsLoadingImages] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues:
      mode === "create"
        ? initialFormValues
        : {
            title: wish!.title,
            price: wish!.price ?? undefined,
            currency: (wish!.currency ?? "USD") as string,
            imageUrl: wish!.imageUrl ?? "",
            destinationUrl: wish!.destinationUrl ?? "",
            description: wish!.description ?? "",
            quantity: wish!.quantity,
            autoUpdatePrice: wish!.autoUpdatePrice ?? false,
          },
  });

  React.useEffect(() => {
    if (mode === "edit" && wish) {
      form.reset({
        title: wish.title,
        price: wish.price ?? undefined,
        currency: (wish.currency ?? "USD") as string,
        imageUrl: wish.imageUrl ?? "",
        destinationUrl: wish.destinationUrl ?? "",
        description: wish.description ?? "",
        quantity: wish.quantity,
        autoUpdatePrice: wish.autoUpdatePrice ?? false,
      });
    }
  }, [mode, wish, form]);

  React.useEffect(() => {
    if (open) {
      setAvailableImages([]);
      setIsLoadingImages(false);
      if (mode === "edit" && wish?.destinationUrl) {
        setIsLoadingImages(true);
        getUrlMetadata(wish.destinationUrl)
          .then((result) => {
            if (result.success && result.data?.images?.length) {
              setAvailableImages(result.data.images);
            }
          })
          .finally(() => {
            setIsLoadingImages(false);
          });
      }
    } else {
      setAvailableImages([]);
      setIsLoadingImages(false);
    }
  }, [open, mode, wish?.destinationUrl]);

  const handleUrlFetch = async () => {
    if (!url) return;
    setIsLoading(true);
    try {
      const result = await getUrlMetadata(url);
      if (result.success && result.data) {
        if (result.data.images?.length) {
          setAvailableImages(result.data.images);
          form.setValue("imageUrl", result.data.images[0]);
        }

        const canAutoSync =
          result.data.price !== undefined &&
          result.data.currency !== undefined &&
          isCurrencyValue(result.data.currency);

        form.reset({
          ...initialFormValues,
          destinationUrl: result.data.destinationUrl || url,
          title: result.data.title || "",
          price: result.data.price,
          currency: isCurrencyValue(result.data.currency)
            ? result.data.currency
            : "USD",
          description: result.data.description || "",
          autoUpdatePrice: canAutoSync,
          imageUrl: result.data.images?.[0] || "",
        });
        setStep("form");
      } else {
        toast.error(result.error || "Failed to process URL");
      }
    } catch (e) {
      toast.error("Failed to process URL");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      let imageUrl = data.imageUrl;

      // Only handle images if we have a file or URL
      if (selectedFile) {
        const uploadResult = await uploadImageToBlob(
          {
            name: selectedFile.name,
            type: selectedFile.type,
            data: Array.from(new Uint8Array(await selectedFile.arrayBuffer())),
          },
          wishlistId
        );
        if (uploadResult.success) {
          imageUrl = uploadResult.url;
        }
      } else if (
        data.imageUrl &&
        !data.imageUrl.includes("blob.vercel.store") &&
        !data.imageUrl.startsWith("blob:")
      ) {
        const uploadResult = await fetchAndUploadImage(
          data.imageUrl,
          wishlistId
        );
        if (uploadResult.success) {
          imageUrl = uploadResult.url;
        }
      } else if (!data.imageUrl) {
        // If no image URL and no file, set to empty string
        imageUrl = "";
      }

      const result =
        mode === "create"
          ? await createWish(wishlistId, {
              ...data,
              imageUrl: imageUrl || "",
            })
          : await updateWish(wish!.id, wishlistId, {
              ...data,
              imageUrl: imageUrl || "",
            });

      if (result.success) {
        toast.success(
          `Wish ${mode === "create" ? "created" : "updated"} successfully`
        );
        if (mode === "create") {
          form.reset(initialFormValues);
          setStep("url");
          setUrl("");
        }
        router.refresh();
        setOpen(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteUrl = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setIsValidUrl(validateUrl(text));
    } catch (err) {
      toast.error("Failed to read clipboard");
      console.error(err);
    }
  };

  const isCurrencyValue = (value: string | undefined): value is string => {
    return !!value && CURRENCIES.some((c) => c.value === value);
  };

  const handleCreateManually = () => {
    form.reset({
      ...initialFormValues,
      destinationUrl: url,
    });
    setStep("form");
  };

  const validateUrl = (value: string) => {
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

  const resetPreviewRef = React.useRef<() => void>();

  const content = (
    <>
      {mode === "create" && step === "url" ? (
        <>
          <div className={cn("space-y-2", !isDesktop && "px-4")}>
            <div className="flex justify-between items-center">
              <Label htmlFor="url">Product URL</Label>
              <span
                className="text-sm text-primary cursor-pointer flex items-center gap-1"
                onClick={handlePasteUrl}
              >
                Paste from clipboard
              </span>
            </div>
            <Input
              id="url"
              placeholder="e.g. https://www.amazon.com/dp/B08N5L5R6Q"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setIsValidUrl(validateUrl(e.target.value));
              }}
            />
          </div>
          {isDesktop ? (
            <DialogFooter className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCreateManually}
              >
                <BrickWall />
                Manually
              </Button>
              <Button
                onClick={handleUrlFetch}
                disabled={isLoading || !isValidUrl}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Brain />
                    Fetch
                  </>
                )}
              </Button>
            </DialogFooter>
          ) : (
            <DrawerFooter className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCreateManually}
              >
                <BrickWall />
                Manually
              </Button>
              <Button
                onClick={handleUrlFetch}
                disabled={isLoading || !isValidUrl}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Brain />
                    Fetch
                  </>
                )}
              </Button>
            </DrawerFooter>
          )}
        </>
      ) : (
        <>
          {isDesktop ? (
            <div className="space-y-4">
              <WishForm
                form={form}
                mode={mode}
                onSubmit={handleSubmit}
                availableImages={availableImages}
                onFileSelect={setSelectedFile}
                resetPreviewRef={resetPreviewRef}
                isLoadingImages={isLoadingImages}
              />
            </div>
          ) : (
            <ScrollArea className="h-[60vh]" type="always" scrollHideDelay={0}>
              <div className="px-4 py-4">
                <div className="space-y-4">
                  <WishForm
                    form={form}
                    mode={mode}
                    onSubmit={handleSubmit}
                    availableImages={availableImages}
                    onFileSelect={setSelectedFile}
                    resetPreviewRef={resetPreviewRef}
                    isLoadingImages={isLoadingImages}
                  />
                </div>
              </div>
            </ScrollArea>
          )}
          {isDesktop ? (
            <DialogFooter className="grid grid-cols-2 gap-2">
              {mode === "create" ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset(initialFormValues);
                    setStep("url");
                    setUrl("");
                    setIsValidUrl(false);
                  }}
                >
                  <RotateCcw />
                  Start over
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset({
                      title: wish!.title,
                      price: wish!.price ?? undefined,
                      currency: (wish!.currency ?? "USD") as string,
                      imageUrl: wish!.imageUrl ?? "",
                      destinationUrl: wish!.destinationUrl ?? "",
                      description: wish!.description ?? "",
                      quantity: wish!.quantity,
                      autoUpdatePrice: wish!.autoUpdatePrice ?? false,
                    });
                    resetPreviewRef.current?.();
                  }}
                >
                  <RotateCcw />
                  Reset
                </Button>
              )}
              <Button type="submit" form="wish-form" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    {mode === "create" ? "Creating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <BadgePlus />
                    {mode === "create" ? "Create" : "Save"}
                  </>
                )}
              </Button>
            </DialogFooter>
          ) : (
            <DrawerFooter className="grid grid-cols-2 gap-2 border-t shadow-[0_-2px_4px_rgba(0,0,0,0.025)]">
              {mode === "create" ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset(initialFormValues);
                    setStep("url");
                    setUrl("");
                    setIsValidUrl(false);
                  }}
                >
                  <RotateCcw />
                  Start over
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset({
                      title: wish!.title,
                      price: wish!.price ?? undefined,
                      currency: (wish!.currency ?? "USD") as string,
                      imageUrl: wish!.imageUrl ?? "",
                      destinationUrl: wish!.destinationUrl ?? "",
                      description: wish!.description ?? "",
                      quantity: wish!.quantity,
                      autoUpdatePrice: wish!.autoUpdatePrice ?? false,
                    });
                    resetPreviewRef.current?.();
                  }}
                >
                  <RotateCcw />
                  Reset
                </Button>
              )}
              <Button type="submit" form="wish-form" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    {mode === "create" ? "Creating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <BadgePlus />
                    {mode === "create" ? "Create" : "Save"}
                  </>
                )}
              </Button>
            </DrawerFooter>
          )}
        </>
      )}
    </>
  );

  return isDesktop ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? step === "url"
                ? "Add something to your wishlist"
                : "Fill in the details"
              : "Edit wish"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? step === "url"
                ? "Found something special? Let's add it to your wishlist!"
                : "Tell us more about what you'd like to receive."
              : "Update the details of your wish"}
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader
          className={cn(
            step === "form" && "border-b shadow-[0_2px_4px_rgba(0,0,0,0.025)]"
          )}
        >
          <DrawerTitle>
            {mode === "create"
              ? step === "url"
                ? "Add a wish"
                : "Create a wish"
              : "Edit wish"}
          </DrawerTitle>
          <DrawerDescription>
            {mode === "create"
              ? step === "url"
                ? "Found something special? Let's add it to your wishlist!"
                : "Tell us more about what you'd like to receive."
              : "Update the details of your wish"}
          </DrawerDescription>
        </DrawerHeader>
        {content}
      </DrawerContent>
    </Drawer>
  );
}
