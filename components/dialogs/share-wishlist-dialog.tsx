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
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Share2 } from "lucide-react";
import { toggleWishlistSharing } from "@/actions/wishlist";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const shareUrl = shareId ? `${window.location.origin}/shared/${shareId}` : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Copied!",
      description: "Share link copied to clipboard",
    });
  };

  const handleToggleSharing = async () => {
    const result = await toggleWishlistSharing(wishlistId);
    if (result.success) {
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
    }
  };

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

        <div className="flex flex-col gap-4">
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant={sharing ? "destructive" : "default"}
              onClick={handleToggleSharing}
            >
              {sharing ? "Disable sharing" : "Enable sharing"}
            </Button>
          </div>

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

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
