"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { toggleWishlistSharing } from "@/actions/wishlist";
import { useMediaQuery } from "@/hooks/use-media-query";
import toast from "react-hot-toast";

interface ShareWishlistDialogProps {
  wishlistId: string;
  isShared: boolean;
  shareId?: string | null;
}

export function ShareWishlistDialog({
  wishlistId,
  isShared,
  shareId,
}: ShareWishlistDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [sharing, setSharing] = React.useState(isShared);
  const [shareUrl, setShareUrl] = React.useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [showCheck, setShowCheck] = React.useState(false);

  React.useEffect(() => {
    if (shareId) {
      setShareUrl(`${window.location.origin}/shared/${shareId}`);
    }
  }, [shareId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setShowCheck(true);
    toast.success("Share link copied to clipboard");

    setTimeout(() => {
      setShowCheck(false);
    }, 2000);
  };

  const handleToggleSharing = async () => {
    await toast.promise(toggleWishlistSharing(wishlistId), {
      loading: sharing ? "Disabling sharing..." : "Enabling sharing...",
      success: (result) => {
        if (result.success && typeof result.isShared === "boolean") {
          setSharing(result.isShared);
          if (result.isShared && result.shareId) {
            setShareUrl(`${window.location.origin}/shared/${result.shareId}`);
          } else {
            setShareUrl("");
          }
          return result.isShared
            ? "Anyone with the link can now view this wishlist"
            : "This wishlist is now private";
        }
        throw new Error(result.error || "Failed to update sharing status");
      },
      error: (err) => err.message || "Failed to update sharing status",
    });
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
        <DialogTrigger asChild>
          <Button variant="outline">Share</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share wishlist</DialogTitle>
            <DialogDescription>
              {sharing
                ? "Anyone with this link can view this wishlist"
                : "Enable sharing to get a shareable link"}
            </DialogDescription>
          </DialogHeader>
          {sharing && (
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="link">Share link</Label>
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
            >
              Cancel
            </Button>
            <Button
              className="w-full"
              onClick={handleToggleSharing}
              variant={sharing ? "destructive" : "default"}
            >
              {sharing ? "Disable sharing" : "Enable sharing"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Share</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Share wishlist</DrawerTitle>
            <DrawerDescription>
              {sharing
                ? "Anyone with this link can view this wishlist"
                : "Enable sharing to get a shareable link"}
            </DrawerDescription>
          </DrawerHeader>
          {sharing && (
            <div className="p-4">
              <div className="grid gap-2">
                <Label htmlFor="mobile-link">Share link</Label>
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
            </div>
          )}
          <DrawerFooter className="pt-2">
            <Button
              onClick={handleToggleSharing}
              variant={sharing ? "destructive" : "default"}
            >
              {sharing ? "Disable sharing" : "Enable sharing"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
