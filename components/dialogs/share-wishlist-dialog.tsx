"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { toggleWishlistSharing } from "@/actions/wishlist";
import { useMediaQuery } from "@/hooks/use-media-query";
import toast from "react-hot-toast";
import { useTranslations } from "@/hooks/use-translations";

interface ShareWishlistDialogProps {
  wishlistId: string;
  isShared: boolean;
  shareId: string | null;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function ShareWishlistDialog({
  wishlistId,
  isShared,
  shareId,
  open,
  setOpen,
}: ShareWishlistDialogProps) {
  const [sharing, setSharing] = React.useState(isShared);
  const [shareUrl, setShareUrl] = React.useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [showCheck, setShowCheck] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const t = useTranslations();
  React.useEffect(() => {
    if (shareId) {
      setShareUrl(`${window.location.origin}/shared/${shareId}`);
    }
  }, [shareId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setShowCheck(true);
    toast.success(t.wishes.shareDialog.copiedToClipboard);

    setTimeout(() => {
      setShowCheck(false);
    }, 2000);
  };

  const handleToggleSharing = async () => {
    setIsLoading(true);
    try {
      const result = await toggleWishlistSharing(wishlistId);

      if (result.success && typeof result.isShared === "boolean") {
        setSharing(result.isShared);
        if (result.isShared && result.shareId) {
          setShareUrl(`${window.location.origin}/shared/${result.shareId}`);
        } else {
          setShareUrl("");
        }
        toast.success(
          result.isShared
            ? t.wishes.shareDialog.enableSuccess
            : t.wishes.shareDialog.disableSuccess
        );
      } else {
        toast.error(result.error || t.error);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const CopyButton = () => (
    <Button
      onClick={copyToClipboard}
      type="button"
      size="icon"
      variant="outline"
      className="transition-colors"
    >
      {showCheck ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.wishes.shareDialog.headline}</DialogTitle>
            <DialogDescription>
              {sharing
                ? t.wishes.shareDialog.descriptionEnabled
                : t.wishes.shareDialog.descriptionDisabled}
            </DialogDescription>
          </DialogHeader>
          {sharing && (
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="link">
                  {t.wishes.shareDialog.shareLinkLabel}
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="link"
                    value={shareUrl}
                    readOnly
                    className="flex-1"
                  />
                  <CopyButton />
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              {t.wishes.shareDialog.cancelButton}
            </Button>
            <Button
              className="w-full"
              onClick={handleToggleSharing}
              variant={sharing ? "destructive" : "default"}
              disabled={isLoading}
              isLoading={isLoading}
            >
              {t.wishes.shareDialog.disableButton}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} repositionInputs={false}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t.wishes.shareDialog.headline}</DrawerTitle>
          <DrawerDescription>
            {sharing
              ? t.wishes.shareDialog.descriptionEnabled
              : t.wishes.shareDialog.descriptionDisabled}
          </DrawerDescription>
        </DrawerHeader>
        {sharing && (
          <div className="grid gap-2">
            <Label htmlFor="mobile-link">
              {t.wishes.shareDialog.shareLinkLabel}
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="mobile-link"
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <CopyButton />
            </div>
          </div>
        )}
        <DrawerFooter>
          <Button
            onClick={handleToggleSharing}
            variant={sharing ? "destructive" : "default"}
            isLoading={isLoading}
          >
            {sharing
              ? t.wishes.shareDialog.disableButton
              : t.wishes.shareDialog.enableButton}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">
              {t.wishes.shareDialog.cancelButton}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
