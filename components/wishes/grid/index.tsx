"use client";

import * as React from "react";
import { type wishes } from "@/lib/db";
import { type InferSelectModel } from "drizzle-orm";
import { ImagePositionDialog } from "@/components/dialogs/image-position-dialog";
import { DeleteWishDialog } from "@/components/dialogs/delete-wish-dialog";
import { EditWishDialog } from "@/components/dialogs/edit-wish-dialog";
import { WishCard } from "./wish-card";
import { updateWishPosition } from "@/actions/wish";
import { useToast } from "@/hooks/use-toast";

type Wish = InferSelectModel<typeof wishes>;

interface ImageDimension {
  imageRatio: number;
  isImageTallerThanContainer: boolean;
}

interface WishesGridProps {
  wishes: Wish[];
  readonly?: boolean;
}

export function WishesGrid({ wishes, readonly = false }: WishesGridProps) {
  const { toast } = useToast();
  const [imageDimensions, setImageDimensions] = React.useState<
    Record<string, ImageDimension>
  >({});
  const [selectedWish, setSelectedWish] = React.useState<Wish | null>(null);
  const [imagePositionOpen, setImagePositionOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);

  const handleDelete = (wish: Wish) => {
    setSelectedWish(wish);
    setDeleteDialogOpen(true);
  };

  const handleAdjustImage = (wish: Wish) => {
    setSelectedWish(wish);
    setImagePositionOpen(true);
  };

  const handleMoveUp = async (wish: Wish) => {
    const result = await updateWishPosition(wish.id, wish.wishlistId, "up");
    if (!result.success) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleMoveDown = async (wish: Wish) => {
    const result = await updateWishPosition(wish.id, wish.wishlistId, "down");
    if (!result.success) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (wish: Wish) => {
    setSelectedWish(wish);
    setEditDialogOpen(true);
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wishes.map((wish, index) => (
          <WishCard
            key={wish.id}
            wish={wish}
            imageDimensions={imageDimensions}
            setImageDimensions={setImageDimensions}
            onDelete={handleDelete}
            onAdjustImage={handleAdjustImage}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onEdit={handleEdit}
            isFirst={index === 0}
            isLast={index === wishes.length - 1}
            readonly={readonly}
          />
        ))}
      </div>

      {!readonly && selectedWish?.imageUrl && (
        <ImagePositionDialog
          wish={selectedWish}
          open={imagePositionOpen}
          onOpenChange={setImagePositionOpen}
        />
      )}

      {!readonly && selectedWish && (
        <DeleteWishDialog
          id={selectedWish.id}
          wishlistId={selectedWish.wishlistId}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      )}

      {!readonly && selectedWish && (
        <EditWishDialog
          wish={selectedWish}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </>
  );
}
