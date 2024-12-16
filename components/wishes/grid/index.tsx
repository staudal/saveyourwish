"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { WishCard } from "./wish-card";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { updateBulkWishPositions } from "@/actions/wish";
import toast from "react-hot-toast";
import { ImagePositionDialog } from "@/components/dialogs/image-position-dialog";
import { ShareWishlistDialog } from "@/components/dialogs/share-wishlist-dialog";
import { ArrowUpDown, Check, Plus, Share2, X, Pencil } from "lucide-react";
import { ReserveWishDialog } from "@/components/dialogs/reserve-wish-dialog";
import { RemoveReservationDialog } from "@/components/dialogs/remove-reservation-dialog";
import { Wish } from "./types";
import Image from "next/image";
import { WishDialog } from "@/components/dialogs/wish-dialog";
import { WishlistDialog } from "@/components/dialogs/wishlist-dialog";
import { DeleteWishlistDialog } from "@/components/dialogs/delete-wishlist-dialog";

interface WishesGridProps {
  wishes: Wish[];
  wishlistId: string;
  readonly?: boolean;
  isShared?: boolean;
  shareId?: string | null;
  title: string;
  coverImage?: string | null;
  unsplashId?: string | null;
  onEdit?: () => void;
  onShareChange?: (isShared: boolean, shareId: string | null) => void;
  onDelete?: () => void;
  onWishlistUpdate?: () => void;
}

export function WishesGrid({
  wishes,
  wishlistId,
  readonly,
  isShared = false,
  shareId = null,
  title,
  coverImage,
  unsplashId,
  onEdit,
  onShareChange,
}: WishesGridProps) {
  const [items, setItems] = useState(wishes);
  const [reorderState, setReorderState] = useState({
    isReordering: false,
    hasChanges: false,
    isSaving: false,
  });
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const [imageDimensions, setImageDimensions] = useState<
    Record<string, { imageRatio: number; isImageTallerThanContainer: boolean }>
  >({});
  const [dialogState, setDialogState] = useState({
    edit: false,
    delete: false,
    imagePosition: false,
    create: false,
    reserve: false,
    removeReservation: false,
    share: false,
    editWishlist: false,
    deleteWishlist: false,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!reorderState.isReordering) {
      setItems(wishes);
      setReorderState((prev) => ({ ...prev, hasChanges: false }));
    }
  }, [wishes, reorderState.isReordering]);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    setItems((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);

      const hasPositionChanges = newItems.some(
        (item, index) => wishes[index]?.id !== item.id
      );
      setReorderState((prev) => ({ ...prev, hasChanges: hasPositionChanges }));

      return newItems;
    });
  };

  const handleSave = async () => {
    setReorderState((prev) => ({ ...prev, isSaving: true }));
    const positions = items.map((item, index) => ({
      id: item.id,
      position: index + 1,
    }));

    const result = await updateBulkWishPositions(wishlistId, positions);

    if (result.success) {
      toast.success("Wishes reordered successfully!");
      setReorderState({
        isReordering: false,
        hasChanges: false,
        isSaving: false,
      });
    } else {
      toast.error("Something went wrong");
      setReorderState((prev) => ({ ...prev, isSaving: false }));
    }
  };

  const openDialog = (dialogType: keyof typeof dialogState, wish?: Wish) => {
    if (wish) setSelectedWish(wish);
    setDialogState((prev) => ({ ...prev, [dialogType]: true }));
  };

  const renderHeader = () => (
    <div className="w-full h-[200px] md:h-[300px] relative rounded-lg overflow-hidden border border-border">
      {/* Background image or fallback */}
      {coverImage ? (
        <Image
          src={coverImage}
          alt={title}
          className="object-cover"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

      {/* Unsplash attribution */}
      {coverImage && unsplashId && (
        <div className="absolute top-4 right-4">
          <a
            href={`https://unsplash.com/photos/${unsplashId}?utm_source=saveyourwish&utm_medium=referral`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white hover:underline bg-black/50 px-2 py-1 rounded-md"
          >
            Photo from Unsplash
          </a>
        </div>
      )}

      {/* Title and buttons */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
          {title}
        </h1>
        {!readonly && (
          <div className="flex items-center gap-2">
            {reorderState.isReordering ? (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setReorderState({
                      isReordering: false,
                      hasChanges: false,
                      isSaving: false,
                    })
                  }
                  disabled={reorderState.isSaving}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  onClick={handleSave}
                  disabled={!reorderState.hasChanges || reorderState.isSaving}
                  isLoading={reorderState.isSaving}
                  className="relative"
                >
                  <Check className="h-4 w-4" />
                  {reorderState.hasChanges && (
                    <span className="absolute -right-1 -top-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                    </span>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setDialogState((prev) => ({ ...prev, editWishlist: true }))
                  }
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setDialogState((prev) => ({ ...prev, share: true }))
                  }
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                {onEdit && (
                  <Button variant="outline" size="icon" onClick={onEdit}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {wishes.length > 0 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setReorderState((prev) => ({
                        ...prev,
                        isReordering: true,
                      }))
                    }
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="default"
                  size="icon"
                  onClick={() =>
                    setDialogState((prev) => ({ ...prev, create: true }))
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center p-8 mt-8 border-2 border-dashed rounded-lg border-muted">
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-lg font-medium">No wishes yet</h3>
        <p className="text-sm text-muted-foreground">
          Start by adding your first wish to this list
        </p>
        <Button
          onClick={() => setDialogState((prev) => ({ ...prev, create: true }))}
          className="mt-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add your first wish
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderHeader()}

      {items.length === 0 && !readonly ? (
        renderEmptyState()
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={rectSortingStrategy}
            disabled={!reorderState.isReordering}
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((wish) => (
                <WishCard
                  key={wish.id}
                  wish={wish}
                  isReordering={reorderState.isReordering}
                  readonly={readonly}
                  isSharedView={isShared}
                  imageDimensions={imageDimensions}
                  setImageDimensions={setImageDimensions}
                  onDelete={() => openDialog("delete", wish)}
                  onAdjustImage={() => openDialog("imagePosition", wish)}
                  onEdit={() => openDialog("edit", wish)}
                  onReserve={() =>
                    openDialog(
                      wish.reservation ? "removeReservation" : "reserve",
                      wish
                    )
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Dialogs */}
      <WishDialog
        mode="create"
        open={dialogState.create}
        setOpen={(open) =>
          setDialogState((prev) => ({ ...prev, create: open }))
        }
        wishlistId={wishlistId}
      />
      <ShareWishlistDialog
        wishlistId={wishlistId}
        isShared={isShared}
        shareId={shareId}
        open={dialogState.share}
        setOpen={(open) => setDialogState((prev) => ({ ...prev, share: open }))}
        onShareChange={onShareChange}
      />
      {selectedWish && (
        <>
          <WishDialog
            mode="edit"
            open={dialogState.edit}
            setOpen={(open) =>
              setDialogState((prev) => ({ ...prev, edit: open }))
            }
            wish={selectedWish}
            wishlistId={wishlistId}
          />
          {selectedWish.imageUrl && (
            <ImagePositionDialog
              wish={selectedWish}
              open={dialogState.imagePosition}
              onOpenChange={(open) =>
                setDialogState((prev) => ({ ...prev, imagePosition: open }))
              }
            />
          )}
          <ReserveWishDialog
            wish={selectedWish}
            open={dialogState.reserve}
            onOpenChange={(open) =>
              setDialogState((prev) => ({ ...prev, reserve: open }))
            }
          />
          <RemoveReservationDialog
            wish={selectedWish}
            open={dialogState.removeReservation}
            onOpenChange={(open) =>
              setDialogState((prev) => ({ ...prev, removeReservation: open }))
            }
          />
        </>
      )}
      <WishlistDialog
        mode="edit"
        open={dialogState.editWishlist}
        setOpen={(open) =>
          setDialogState((prev) => ({ ...prev, editWishlist: open }))
        }
        wishlist={{
          id: wishlistId,
          title,
          coverImage: coverImage ?? null,
          userId: "",
          favorite: false,
          shared: isShared,
          shareId: shareId ?? null,
          unsplashId: unsplashId ?? null,
        }}
      />
      <DeleteWishlistDialog
        id={wishlistId}
        title={title}
        isShared={isShared}
        open={dialogState.deleteWishlist}
        onOpenChange={(open) =>
          setDialogState((prev) => ({ ...prev, deleteWishlist: open }))
        }
      />
    </div>
  );
}
