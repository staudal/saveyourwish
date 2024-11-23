"use client";

import { type wishes } from "@/lib/db";
import { type InferSelectModel } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PencilIcon, Trash2Icon, Move } from "lucide-react";
import Image from "next/image";
import { DeleteWishDialog } from "@/components/dialogs/delete-wish-dialog";
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "./ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImagePositionDialog } from "@/components/dialogs/image-position-dialog";

type Wish = InferSelectModel<typeof wishes>;

interface ImageDimension {
  imageRatio: number;
  isImageTallerThanContainer: boolean;
}

export function WishesGrid({ wishes }: { wishes: Wish[] }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [imagePositionOpen, setImagePositionOpen] = React.useState(false);
  const [selectedWish, setSelectedWish] = React.useState<Wish | null>(null);
  const [imageDimensions, setImageDimensions] = React.useState<
    Record<string, ImageDimension>
  >({});

  const getTranslateX = (wish: Wish, dimensions?: ImageDimension) => {
    if (!dimensions) return 0;
    const containerRatio = 16 / 9;
    const isImageWiderThanContainer = dimensions.imageRatio > containerRatio;

    if (!isImageWiderThanContainer && (wish.imageZoom ?? 1) <= 1) return 0;
    const overflow = isImageWiderThanContainer
      ? (dimensions.imageRatio / containerRatio - 1) * 100
      : ((wish.imageZoom ?? 1) - 1) * 100;
    return (((wish.horizontalPosition ?? 50) - 50) / 50) * (overflow / 2);
  };

  const getTranslateY = (wish: Wish, dimensions?: ImageDimension) => {
    if (!dimensions) return 0;
    const containerRatio = 16 / 9;
    const isImageTallerThanContainer = dimensions.imageRatio < containerRatio;

    if (!isImageTallerThanContainer && (wish.imageZoom ?? 1) <= 1) return 0;
    let overflow;
    if (isImageTallerThanContainer) {
      const imageRatioValue = dimensions.imageRatio;
      overflow = (imageRatioValue / containerRatio - 1) * 100;
    } else {
      overflow = ((wish.imageZoom ?? 1) - 1) * 100;
    }
    return (((wish.verticalPosition ?? 50) - 50) / 50) * (overflow / 2);
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wishes.map((wish) => (
          <div key={wish.id} className="flex flex-col h-full">
            <div className="relative">
              <div className="absolute right-2 top-2 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuLabel>Manage wish</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <PencilIcon className="h-4 w-4 mr-2" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    {wish.imageUrl && (
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedWish(wish);
                          setImagePositionOpen(true);
                        }}
                      >
                        <Move className="h-4 w-4 mr-2" />
                        <span>Adjust image</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedWish(wish);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2Icon className="h-4 w-4 mr-2" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {wish.imageUrl && (
                <div className="w-full overflow-hidden">
                  <AspectRatio ratio={16 / 9}>
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                      <Image
                        src={wish.imageUrl}
                        alt={wish.title}
                        className="absolute"
                        width={1000}
                        height={1000}
                        style={{
                          width: imageDimensions[wish.id]
                            ?.isImageTallerThanContainer
                            ? "100%"
                            : "auto",
                          height: imageDimensions[wish.id]
                            ?.isImageTallerThanContainer
                            ? "auto"
                            : "100%",
                          transform: `
                            translate(
                              ${getTranslateX(wish, imageDimensions[wish.id])}%,
                              ${getTranslateY(wish, imageDimensions[wish.id])}%
                            )
                            scale(${wish.imageZoom ?? 1})
                          `,
                          transformOrigin: "center",
                        }}
                        onLoad={(e) => {
                          const img = e.target as HTMLImageElement;
                          const imageRatio =
                            img.naturalWidth / img.naturalHeight;
                          const containerRatio = 16 / 9;
                          const isImageTallerThanContainer =
                            imageRatio < containerRatio;
                          setImageDimensions((prev) => ({
                            ...prev,
                            [wish.id]: {
                              imageRatio,
                              isImageTallerThanContainer,
                            },
                          }));
                        }}
                      />
                    </div>
                  </AspectRatio>
                </div>
              )}
            </div>
            <div className="border rounded-b flex flex-col h-full">
              <div className="p-4">
                <div className="font-bold">{wish.title}</div>
                {wish.description && (
                  <p className="text-muted-foreground text-sm">
                    {wish.description}
                  </p>
                )}
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Quantity: {wish.quantity}
                  </p>
                </div>
              </div>
              <div className="flex-1"></div>
              <Separator orientation="horizontal" />
              <div className="flex justify-between items-center p-4">
                {wish.destinationUrl && (
                  <p className="text-sm text-muted-foreground">
                    {new URL(wish.destinationUrl).host.replace("www.", "")}
                  </p>
                )}
                {wish.price && (
                  <p className="text-sm text-muted-foreground">
                    ${wish.price.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedWish?.imageUrl && (
        <ImagePositionDialog
          wish={selectedWish}
          open={imagePositionOpen}
          onOpenChange={setImagePositionOpen}
        />
      )}
      {selectedWish && (
        <DeleteWishDialog
          id={selectedWish.id}
          wishlistId={selectedWish.wishlistId}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      )}
    </>
  );
}
