"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { CreateWishForm } from "../forms/create-wish-form";
import { useMediaQuery } from "@/hooks/use-media-query";
import { CURRENCY_VALUES } from "@/constants";
import { BadgePlus, Brain, BrickWall, Loader2, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUrlMetadata } from "@/actions/wish";
import toast from "react-hot-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CreateWishDialogProps {
  wishlistId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const initialFormValues: FormValues = {
  title: "",
  price: 0,
  currency: CURRENCY_VALUES[0],
  imageUrl: "",
  destinationUrl: "",
  description: "",
  quantity: 1,
  autoUpdatePrice: false,
  isUrlLocked: false,
};

export type FormValues = {
  title: string;
  price: number;
  currency: (typeof CURRENCY_VALUES)[number];
  imageUrl: string;
  destinationUrl: string;
  description: string;
  quantity: number;
  autoUpdatePrice: boolean;
  isUrlLocked: boolean;
};

type Step = "url" | "form";

interface CreateWishFlowProps {
  wishlistId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  step: Step;
  setStep: (step: Step) => void;
  url: string;
  setUrl: (url: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  formValues: FormValues;
  setFormValues: (values: FormValues) => void;
  availableImages: string[];
  setAvailableImages: (images: string[]) => void;
  formRef: React.RefObject<{
    reset: (values: FormValues) => void;
    setSelectedFile: (file: File | null) => void;
    setPreviewUrl: (url: string | null) => void;
    setValue: <T extends keyof FormValues>(
      name: T,
      value: FormValues[T]
    ) => void;
  }>;
  handleReset: () => void;
  handlePasteUrl: () => void;
  handleNext: () => void;
  handleCreateManually: () => void;
  isImageSelectorOpen: boolean;
  setIsImageSelectorOpen: (open: boolean) => void;
  onPriceSync?: () => void;
  isPriceSyncing: boolean;
}

function DesktopDialog({
  wishlistId,
  open,
  setOpen,
  step,
  url,
  setUrl,
  isLoading,
  setIsLoading,
  formValues,
  setFormValues,
  formRef,
  handleReset,
  handlePasteUrl,
  handleNext,
  handleCreateManually,
  availableImages,
  setIsImageSelectorOpen,
  onPriceSync,
  isPriceSyncing,
}: CreateWishFlowProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        {step === "url" ? (
          <>
            <DialogHeader>
              <DialogTitle>Add something to your wishlist</DialogTitle>
              <DialogDescription>
                Found something special? Let&apos;s add it to your wishlist!
                Drop a link below and we&apos;ll do the magic.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="url">Link to product</Label>
                <span
                  className="text-sm text-primary cursor-pointer"
                  onClick={handlePasteUrl}
                >
                  Paste URL from clipboard
                </span>
              </div>
              <Input
                id="url"
                placeholder="e.g. https://www.amazon.com/dp/B08N5L5R6Q"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCreateManually}
              >
                <BrickWall />
                Create manually
              </Button>
              <Button onClick={handleNext} disabled={isLoading || !url}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Fetching details...
                  </>
                ) : (
                  <>
                    <Brain />
                    Fetch details
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Fill in the details</DialogTitle>
              <DialogDescription>
                Tell us more about what you&apos;d like to receive.
              </DialogDescription>
            </DialogHeader>
            <CreateWishForm
              ref={formRef}
              wishlistId={wishlistId}
              onSuccess={() => {
                handleReset();
                setOpen(false);
              }}
              onLoadingChange={setIsLoading}
              values={formValues}
              onChange={setFormValues}
              isManualMode={!formValues.autoUpdatePrice}
              availableImages={availableImages}
              onImageSelectorOpen={() => setIsImageSelectorOpen(true)}
              onPriceSync={onPriceSync}
              isPriceSyncing={isPriceSyncing}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleReset}>
                <RotateCcw />
                Start over
              </Button>
              <Button
                type="submit"
                form="create-wish-form"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 />
                    Saving...
                  </>
                ) : (
                  <>
                    <BadgePlus />
                    Create
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MobileDrawer({
  wishlistId,
  open,
  setOpen,
  step,
  url,
  setUrl,
  isLoading,
  setIsLoading,
  formValues,
  setFormValues,
  formRef,
  handleReset,
  handlePasteUrl,
  handleNext,
  handleCreateManually,
  setIsImageSelectorOpen,
  availableImages,
  onPriceSync,
  isPriceSyncing,
}: CreateWishFlowProps) {
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="max-h-[90vh]">
        {step === "url" ? (
          <>
            <DrawerHeader>
              <DrawerTitle>Add something to your wishlist</DrawerTitle>
              <DrawerDescription>
                Found something special? Let&apos;s add it to your wishlist!
                Drop a link below and we&apos;ll do the magic.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="url">Link to product</Label>
                  <span
                    className="text-sm text-primary cursor-pointer flex items-center gap-1"
                    onClick={handlePasteUrl}
                  >
                    Paste URL from clipboard
                  </span>
                </div>
                <Input
                  id="url"
                  placeholder="e.g. https://www.amazon.com/dp/B08N5L5R6Q"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>
            <DrawerFooter className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCreateManually}
              >
                <BrickWall />
                Manually
              </Button>
              <Button onClick={handleNext} disabled={isLoading || !url}>
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
          </>
        ) : (
          <>
            <DrawerHeader className="border-b">
              <DrawerTitle>Fill in the details</DrawerTitle>
              <DrawerDescription>
                Tell us more about what you&apos;d like to receive.
              </DrawerDescription>
            </DrawerHeader>
            <ScrollArea className="h-[60vh]" type="always" scrollHideDelay={0}>
              <div className="px-4 py-4">
                <div className="space-y-4">
                  <CreateWishForm
                    ref={formRef}
                    wishlistId={wishlistId}
                    onSuccess={() => {
                      handleReset();
                      setOpen(false);
                    }}
                    onLoadingChange={setIsLoading}
                    values={formValues}
                    onChange={setFormValues}
                    isManualMode={!formValues.autoUpdatePrice}
                    availableImages={availableImages}
                    onImageSelectorOpen={() => setIsImageSelectorOpen(true)}
                    onPriceSync={onPriceSync}
                    isPriceSyncing={isPriceSyncing}
                  />
                </div>
              </div>
            </ScrollArea>
            <DrawerFooter className="grid grid-cols-2 gap-2 border-t">
              <Button type="button" variant="outline" onClick={handleReset}>
                <RotateCcw />
                Start over
              </Button>
              <Button
                type="submit"
                form="create-wish-form"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <BadgePlus />
                    Create
                  </>
                )}
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

export function CreateWishDialog({
  wishlistId,
  open,
  setOpen,
}: CreateWishDialogProps) {
  const [step, setStep] = React.useState<Step>("url");
  const [isLoading, setIsLoading] = React.useState(false);
  const [formValues, setFormValues] =
    React.useState<FormValues>(initialFormValues);
  const [availableImages, setAvailableImages] = React.useState<string[]>([]);
  const formRef = React.useRef<{
    reset: (values: FormValues) => void;
    setSelectedFile: (file: File | null) => void;
    setPreviewUrl: (url: string | null) => void;
    setValue: <T extends keyof FormValues>(
      name: T,
      value: FormValues[T]
    ) => void;
  }>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [url, setUrl] = React.useState("");
  const [isImageSelectorOpen, setIsImageSelectorOpen] = React.useState(false);
  const [isPriceSyncing, setIsPriceSyncing] = React.useState(false);

  const handleReset = () => {
    formRef.current?.reset(initialFormValues);
    setFormValues(initialFormValues);
    setAvailableImages([]);
    setStep("url");
    setUrl("");
  };

  const handlePasteUrl = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      toast.error("Failed to read clipboard");
      console.error(err);
    }
  };

  const handleNext = async () => {
    if (!url) return;

    try {
      setIsLoading(true);
      const result = await getUrlMetadata(url);

      if (result.success && result.data) {
        const newValues = { ...initialFormValues };
        newValues.destinationUrl = result.data.destinationUrl || url;
        if (result.data.title) newValues.title = result.data.title;
        if (result.data.price) newValues.price = result.data.price;
        if (result.data.currency && isCurrencyValue(result.data.currency)) {
          newValues.currency = result.data.currency;
        }
        if (result.data.description)
          newValues.description = result.data.description;
        if (result.data.images?.length) {
          setAvailableImages(result.data.images);
          newValues.imageUrl = result.data.images[0];
        }
        newValues.autoUpdatePrice = true;

        setFormValues(newValues);
        setStep("form");
      }
    } catch (e) {
      toast.error("Failed to process URL");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateManually = () => {
    setFormValues({
      ...initialFormValues,
      destinationUrl: url,
      autoUpdatePrice: false,
      isUrlLocked: false,
    });
    setStep("form");
  };

  const handlePriceSync = async () => {
    if (!formValues.destinationUrl) return;

    try {
      setIsPriceSyncing(true);
      const result = await getUrlMetadata(formValues.destinationUrl);

      if (result.success && result.data && result.data.price) {
        setFormValues((prev) => ({
          ...prev,
          price: result.data.price ?? prev.price,
          currency:
            result.data.currency && isCurrencyValue(result.data.currency)
              ? result.data.currency
              : prev.currency,
          autoUpdatePrice: true,
        }));
      }
    } catch (e) {
      toast.error("Failed to sync price");
      console.error(e);
    } finally {
      setIsPriceSyncing(false);
    }
  };

  const sharedProps = {
    wishlistId,
    open,
    setOpen,
    step,
    setStep,
    url,
    setUrl,
    isLoading,
    setIsLoading,
    formValues,
    setFormValues,
    availableImages,
    setAvailableImages,
    formRef,
    handleReset,
    handlePasteUrl,
    handleNext,
    handleCreateManually,
    isImageSelectorOpen,
    setIsImageSelectorOpen,
    onPriceSync: handlePriceSync,
    isPriceSyncing,
  };

  return (
    <>
      {isDesktop ? (
        <DesktopDialog {...sharedProps} />
      ) : (
        <MobileDrawer {...sharedProps} />
      )}
    </>
  );
}

function isCurrencyValue(
  value: string
): value is (typeof CURRENCY_VALUES)[number] {
  return CURRENCY_VALUES.includes(value as (typeof CURRENCY_VALUES)[number]);
}
