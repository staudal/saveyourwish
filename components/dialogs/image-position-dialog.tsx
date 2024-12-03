"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { type wishes } from "@/lib/db";
import { type InferSelectModel } from "drizzle-orm";
import Image from "next/image";
import { updateWishImagePosition } from "@/actions/wish";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { useTranslations } from "@/hooks/use-translations";

type Wish = InferSelectModel<typeof wishes>;

export function ImagePositionDialog({
  wish,
  open,
  onOpenChange,
}: {
  wish: Wish;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [verticalPosition, setVerticalPosition] = useState(
    wish.verticalPosition ?? 50
  );
  const [horizontalPosition, setHorizontalPosition] = useState(
    wish.horizontalPosition ?? 50
  );
  const [zoom, setZoom] = useState(wish.imageZoom ?? 1);
  const [imageRatio, setImageRatio] = useState<{
    naturalWidth: number;
    naturalHeight: number;
  } | null>(null);
  const t = useTranslations();

  const handleImageLoad = (img: HTMLImageElement) => {
    setImageRatio({
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    });
  };

  const getTranslateX = (position: number) => {
    if (!isImageWiderThanContainer && zoom <= 1) return 0;
    const overflow = isImageWiderThanContainer ? 100 : (zoom - 1) * 100;
    return ((position - 50) / 50) * (overflow / 2);
  };

  const getTranslateY = (position: number) => {
    if (!isImageTallerThanContainer && zoom <= 1) return 0;

    // Calculate the actual overflow percentage
    let overflow;
    if (isImageTallerThanContainer && imageRatio) {
      // Calculate how much taller the image is compared to the container
      const containerRatio = 16 / 9;
      const imageRatioValue =
        imageRatio.naturalWidth / imageRatio.naturalHeight;
      overflow = (imageRatioValue / containerRatio - 1) * 100;
    } else {
      overflow = (zoom - 1) * 100;
    }

    // Limit the translation to half of the overflow in each direction
    return ((position - 50) / 50) * (overflow / 2);
  };

  const handleSave = async () => {
    setIsLoading(true);
    const result = await updateWishImagePosition(wish.id, wish.wishlistId, {
      vertical: verticalPosition,
      horizontal: horizontalPosition,
      zoom,
    });

    if (result.success) {
      toast.success(t.wishes.imagePositionDialog.success);
      onOpenChange(false);
    } else {
      toast.error(t.error);
    }

    setIsLoading(false);
  };

  const containerAspectRatio = 16 / 9;
  const imageAspectRatio = imageRatio
    ? imageRatio.naturalWidth / imageRatio.naturalHeight
    : null;

  const isImageTallerThanContainer = imageAspectRatio
    ? imageAspectRatio < containerAspectRatio
    : false;
  const isImageWiderThanContainer = imageAspectRatio
    ? imageAspectRatio > containerAspectRatio
    : false;

  console.log("Image dimensions:", {
    imageAspectRatio,
    containerAspectRatio,
    isImageTallerThanContainer,
    isImageWiderThanContainer,
  });

  const isHorizontalEnabled = zoom > 1 || isImageWiderThanContainer;
  const isVerticalEnabled = zoom > 1 || isImageTallerThanContainer;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="space-y-6">
          <div className="relative aspect-video overflow-hidden rounded">
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <div
                className="relative"
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  src={wish.imageUrl!}
                  alt={wish.title}
                  className="absolute"
                  style={{
                    width: isImageTallerThanContainer ? "100%" : "auto",
                    height: isImageTallerThanContainer ? "auto" : "100%",
                    transform: `
                      translate(${getTranslateX(
                        horizontalPosition
                      )}%, ${getTranslateY(verticalPosition)}%)
                      scale(${zoom})
                    `,
                    transformOrigin: "center",
                    transition: "transform 0.1s ease-out",
                  }}
                  onLoadingComplete={handleImageLoad}
                  width={imageRatio?.naturalWidth ?? 1000}
                  height={imageRatio?.naturalHeight ?? 1000}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                {t.wishes.imagePositionDialog.verticalPositionLabel}
              </Label>
              <Slider
                value={[verticalPosition]}
                onValueChange={([value]) => setVerticalPosition(value)}
                min={0}
                max={100}
                step={1}
                disabled={!isVerticalEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t.wishes.imagePositionDialog.horizontalPositionLabel}
              </Label>
              <Slider
                value={[horizontalPosition]}
                onValueChange={([value]) => {
                  console.log("Horizontal slider changed:", value);
                  setHorizontalPosition(value);
                }}
                min={0}
                max={100}
                step={1}
                disabled={!isHorizontalEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.wishes.imagePositionDialog.zoomLabel}</Label>
              <Slider
                value={[zoom]}
                onValueChange={([value]) => setZoom(value)}
                min={1}
                max={2}
                step={0.1}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t.wishes.imagePositionDialog.cancel}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              isLoading={isLoading}
            >
              {t.wishes.imagePositionDialog.save}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
