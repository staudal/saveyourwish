"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { CreateWishForm } from "../forms/create-wish-form";
import { useMediaQuery } from "@/hooks/use-media-query";
import { CURRENCY_VALUES } from "@/constants";

interface CreateWishDialogProps {
  wishlistId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const initialFormValues = {
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

export function CreateWishDialog({
  wishlistId,
  open,
  setOpen,
}: CreateWishDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [formValues, setFormValues] =
    React.useState<FormValues>(initialFormValues);
  const formRef = React.useRef<any>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleReset = () => {
    formRef.current?.reset(initialFormValues);
    setFormValues(initialFormValues);
  };

  const DialogComponent = isDesktop ? Dialog : Drawer;
  const DialogContentComponent = isDesktop ? DialogContent : DrawerContent;

  return (
    <DialogComponent open={open} onOpenChange={setOpen}>
      <DialogContentComponent className="sm:max-w-[800px]">
        <div className="p-6">
          <CreateWishForm
            ref={formRef}
            wishlistId={wishlistId}
            onSuccess={() => setOpen(false)}
            onLoadingChange={setIsLoading}
            values={formValues}
            onChange={setFormValues}
          />
        </div>
        <DialogFooter>
          <div className="flex w-full items-center">
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              disabled={Object.entries(formValues).every(
                ([key, value]) =>
                  value === initialFormValues[key as keyof FormValues]
              )}
            >
              Reset
            </Button>
            <div className="ml-auto space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                form="create-wish-form"
                disabled={isLoading}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContentComponent>
    </DialogComponent>
  );
}
