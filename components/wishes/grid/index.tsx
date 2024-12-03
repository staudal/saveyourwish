"use client";

import { ReactSortable } from "react-sortablejs";
import { WishCard } from "./wish-card";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { updateBulkWishPositions } from "@/actions/wish";
import toast from "react-hot-toast";
import { type wishes } from "@/lib/db";
import { type InferSelectModel } from "drizzle-orm";
import { EditWishDialog } from "@/components/dialogs/edit-wish-dialog";
import { DeleteWishDialog } from "@/components/dialogs/delete-wish-dialog";
import { ImagePositionDialog } from "@/components/dialogs/image-position-dialog";
import { ShareWishlistDialog } from "@/components/dialogs/share-wishlist-dialog";
import { CreateWishDialog } from "@/components/dialogs/create-wish-dialog";
import { useTranslations } from "@/hooks/use-translations";

type Wish = InferSelectModel<typeof wishes>;

interface ImageDimension {
  imageRatio: number;
  isImageTallerThanContainer: boolean;
}

interface WishesGridProps {
  wishes: Wish[];
  wishlistId: string;
  readonly?: boolean;
  isShared?: boolean;
  shareId?: string | null;
  title: string;
}

export function WishesGrid({
  wishes,
  wishlistId,
  readonly,
  isShared = false,
  shareId = null,
  title,
}: WishesGridProps) {
  const [items, setItems] = useState(wishes);
  const [isReordering, setIsReordering] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<
    Record<string, ImageDimension>
  >({});
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [imagePositionOpen, setImagePositionOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const t = useTranslations();

  const handleDelete = (wish: Wish) => {
    setSelectedWish(wish);
    setDeleteDialogOpen(true);
  };

  const handleAdjustImage = (wish: Wish) => {
    setSelectedWish(wish);
    setImagePositionOpen(true);
  };

  const handleEdit = (wish: Wish) => {
    setSelectedWish(wish);
    setEditDialogOpen(true);
  };

  // Reset items when wishes prop changes
  useEffect(() => {
    if (!isReordering) {
      setItems(wishes);
      setHasChanges(false);
    }
  }, [wishes, isReordering]);

  const handleSave = async () => {
    setIsSaving(true);

    const positions = items.map((item, index) => ({
      id: item.id,
      position: index + 1,
    }));

    const result = await toast.promise(
      updateBulkWishPositions(wishlistId, positions),
      {
        loading: t.wishes.reorderMode.saving,
        success: t.wishes.reorderMode.success,
        error: t.wishes.reorderMode.error,
      }
    );

    if (result.success) {
      setIsReordering(false);
      setHasChanges(false);
    }

    setIsSaving(false);
  };

  const handleCancel = () => {
    setItems(wishes);
    setIsReordering(false);
    setHasChanges(false);
  };

  const handleSetList = (newList: Wish[]) => {
    setItems(newList);
    // Check if the order has changed
    const hasOrderChanged = newList.some(
      (item, index) => wishes[index]?.id !== item.id
    );
    setHasChanges(hasOrderChanged);
  };

  if (readonly) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wishes.map((wish) => (
          <WishCard
            key={wish.id}
            wish={wish}
            readonly
            imageDimensions={imageDimensions}
            setImageDimensions={setImageDimensions}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        {isReordering && (
          <p className="text-muted-foreground">
            {t.wishes.reorderMode.dragging}
          </p>
        )}
        <div className="flex items-center gap-2">
          {isReordering ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                {t.wishes.reorderMode.cancelButton}
              </Button>
              <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="mr-2">{t.wishes.reorderMode.saving}</span>
                  </>
                ) : (
                  t.wishes.reorderMode.saveButton
                )}
              </Button>
            </>
          ) : (
            <>
              <ShareWishlistDialog
                wishlistId={wishlistId}
                isShared={isShared}
                shareId={shareId}
              />
              <Button variant="outline" onClick={() => setIsReordering(true)}>
                {t.wishes.reorderMode.button}
              </Button>
              <CreateWishDialog wishlistId={wishlistId} />
            </>
          )}
        </div>
      </div>
      <ReactSortable
        list={items}
        setList={handleSetList}
        disabled={!isReordering}
        handle=".drag-handle"
        animation={200}
        delay={1000}
        delayOnTouchOnly={true}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {items.map((wish) => (
          <WishCard
            key={wish.id}
            wish={wish}
            isReordering={isReordering}
            imageDimensions={imageDimensions}
            setImageDimensions={setImageDimensions}
            onDelete={handleDelete}
            onAdjustImage={handleAdjustImage}
            onEdit={handleEdit}
          />
        ))}
      </ReactSortable>

      {selectedWish && (
        <>
          <EditWishDialog
            wish={selectedWish}
            open={editDialogOpen}
            setOpen={setEditDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
          <DeleteWishDialog
            id={selectedWish.id}
            wishlistId={selectedWish.wishlistId}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          />
          {selectedWish.imageUrl && (
            <ImagePositionDialog
              wish={selectedWish}
              open={imagePositionOpen}
              onOpenChange={setImagePositionOpen}
            />
          )}
        </>
      )}
    </div>
  );
}
