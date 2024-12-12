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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { toggleWishlistSharing } from "@/actions/wishlist";
import { useMediaQuery } from "@/hooks/use-media-query";
import toast from "react-hot-toast";

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
  const [currentShareId, setCurrentShareId] = React.useState(shareId);
  const [shareUrl, setShareUrl] = React.useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [showCheck, setShowCheck] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (currentShareId) {
      setShareUrl(`${window.location.origin}/shared/${currentShareId}`);
    } else {
      setShareUrl("");
    }
  }, [currentShareId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setShowCheck(true);
    toast.success("Link copied to clipboard");

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
        setCurrentShareId(result.shareId);
        toast.success(
          result.isShared
            ? "Wishlist shared successfully"
            : "Wishlist unshared successfully"
        );
      } else {
        toast.error(result.error || "Failed to toggle wishlist sharing");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to toggle wishlist sharing"
      );
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
            <DialogTitle>Share wishlist</DialogTitle>
            <DialogDescription>
              {sharing
                ? "Share your wishlist with others"
                : "Hide your wishlist from others"}
            </DialogDescription>
          </DialogHeader>
          {sharing && (
            <div className="flex flex-col gap-4">
              <div className="flex space-y-2 flex-col">
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
          <DialogFooter className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleToggleSharing}
              variant={sharing ? "destructive" : "default"}
              disabled={isLoading}
              isLoading={isLoading}
            >
              {sharing ? "Hide" : "Share"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} repositionInputs={false}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Share wishlist</DrawerTitle>
          <DrawerDescription>
            {sharing
              ? "Your wishlist can now be shared with others. Send the link to your friends and family to let them know what you want!"
              : "Your wishlist is currently hidden from others. No one can see it until you activate share below."}
          </DrawerDescription>
        </DrawerHeader>
        {sharing && (
          <div className="px-4 flex flex-col space-y-2">
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
        )}
        <DrawerFooter>
          <Button
            onClick={handleToggleSharing}
            variant={sharing ? "destructive" : "default"}
            isLoading={isLoading}
          >
            {sharing ? "Hide" : "Share"}
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
