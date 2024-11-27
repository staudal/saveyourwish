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
import { Copy, Share2 } from "lucide-react";
import { toggleWishlistSharing } from "@/actions/wishlist";
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from "@/hooks/use-media-query";

interface ShareWishlistDialogProps {
  wishlistId: string;
  isShared: boolean;
  shareId?: string | null;
}

interface ToggleWishlistSharingResult {
  success: boolean;
  isShared?: boolean;
  shareId?: string | null;
  error?: string;
}

export function ShareWishlistDialog({
  wishlistId,
  isShared,
  shareId,
}: ShareWishlistDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [sharing, setSharing] = React.useState(isShared);
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const shareUrl = shareId ? `${window.location.origin}/shared/${shareId}` : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Copied!",
      description: "Share link copied to clipboard",
    });
  };

  const handleToggleSharing = async () => {
    const result: ToggleWishlistSharingResult = await toggleWishlistSharing(
      wishlistId
    );
    if (result.success && typeof result.isShared === "boolean") {
      setSharing(result.isShared);
      if (result.isShared) {
        toast({
          title: "Wishlist shared",
          description: "Anyone with the link can now view this wishlist",
        });
      } else {
        toast({
          title: "Wishlist unshared",
          description: "This wishlist is now private",
        });
      }
    } else if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const ShareContent = () => (
    <div className="flex flex-col gap-4">
      <Button
        type="button"
        variant={sharing ? "destructive" : "default"}
        onClick={handleToggleSharing}
      >
        {sharing ? "Disable sharing" : "Enable sharing"}
      </Button>

      {sharing && (
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input id="link" value={shareUrl} readOnly />
          </div>
          <Button
            onClick={copyToClipboard}
            type="button"
            size="sm"
            className="px-3"
          >
            <span className="sr-only">Copy</span>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
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
          <ShareContent />
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Share wishlist</DrawerTitle>
          <DrawerDescription>
            {sharing
              ? "Anyone with this link can view this wishlist"
              : "Enable sharing to get a shareable link"}
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <ShareContent />
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
