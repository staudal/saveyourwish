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
import { Drawer, DrawerContent, DrawerFooter } from "@/components/ui/drawer";
import { CreateWishForm } from "../forms/create-wish-form";
import { useMediaQuery } from "@/hooks/use-media-query";
import { CURRENCY_VALUES } from "@/constants";
import { BadgePlus, Brain, BrickWall, Loader2, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUrlMetadata } from "@/actions/wish";
import toast from "react-hot-toast";

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
  formRef: React.RefObject<any>;
  handleReset: () => void;
  handlePasteUrl: () => void;
  handleNext: () => void;
  handleCreateManually: () => void;
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
}: CreateWishFlowProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        {step === "url" ? (
          <>
            <DialogHeader>
              <DialogTitle>Create a new wish</DialogTitle>
              <DialogDescription>
                Throw in a link to a product and we'll fetch the details for you
                or create a wish manually.
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
              <DialogTitle>Create a new wish</DialogTitle>
              <DialogDescription>
                Fill in the details for your wish.
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
}: CreateWishFlowProps) {
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        {step === "url" ? (
          <div className="p-4 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Product URL</Label>
                <Input
                  id="url"
                  placeholder="e.g. https://www.amazon.com/dp/B08N5L5R6Q"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handlePasteUrl}
              >
                Paste URL
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={handleNext} disabled={isLoading || !url}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Fetching details...
                  </>
                ) : (
                  "Next"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCreateManually}
              >
                Create manually
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4">
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
              />
            </div>
            <DrawerFooter>
              <div className="flex w-full flex-col-reverse gap-2">
                <Button type="button" variant="ghost" onClick={handleReset}>
                  Start over
                </Button>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="create-wish-form"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
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
  const formRef = React.useRef<any>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [url, setUrl] = React.useState("");

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
    }
  };

  const handleNext = async () => {
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }

    try {
      setIsLoading(true);
      const result = await getUrlMetadata(url);

      if (result.success && result.data) {
        const newValues = { ...initialFormValues };
        newValues.destinationUrl = result.data.destinationUrl || url;

        if (result.data.images?.[0]) {
          newValues.imageUrl = result.data.images[0];
        }

        if (result.data.title) newValues.title = result.data.title;
        if (result.data.price) newValues.price = result.data.price;
        if (result.data.currency && isCurrencyValue(result.data.currency)) {
          newValues.currency = result.data.currency;
        } else {
          newValues.currency = "USD";
        }
        if (result.data.description)
          newValues.description = result.data.description;

        newValues.autoUpdatePrice = true;

        setFormValues(newValues);
        formRef.current?.reset(newValues);
        setStep("form");
      } else {
        toast.error("Failed to fetch product details");
      }
    } catch (e) {
      toast.error("Failed to process URL");
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
  };

  return isDesktop ? (
    <DesktopDialog {...sharedProps} />
  ) : (
    <MobileDrawer {...sharedProps} />
  );
}

function isCurrencyValue(
  value: string
): value is (typeof CURRENCY_VALUES)[number] {
  return CURRENCY_VALUES.includes(value as (typeof CURRENCY_VALUES)[number]);
}
