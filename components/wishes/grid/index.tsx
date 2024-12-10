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
import { EditWishDialog } from "@/components/dialogs/edit-wish-dialog";
import { DeleteWishDialog } from "@/components/dialogs/delete-wish-dialog";
import { ImagePositionDialog } from "@/components/dialogs/image-position-dialog";
import { ShareWishlistDialog } from "@/components/dialogs/share-wishlist-dialog";
import { CreateWishDialog } from "@/components/dialogs/create-wish-dialog";
import { useTranslations } from "@/hooks/use-translations";
import { ArrowUpDown, Check, Plus, Share2, X } from "lucide-react";
import { ReserveWishDialog } from "@/components/dialogs/reserve-wish-dialog";
import { RemoveReservationDialog } from "@/components/dialogs/remove-reservation-dialog";
import { Wish } from "./types";
import Image from "next/image";

interface WishesGridProps {
  wishes: Wish[];
  wishlistId: string;
  readonly?: boolean;
  isShared?: boolean;
  shareId?: string | null;
  title: string;
  coverImage?: string | null;
}

export function WishesGrid({
  wishes,
  wishlistId,
  readonly,
  isShared = false,
  shareId = null,
  title,
  coverImage,
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
  });

  const t = useTranslations();
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
      toast.success(t.wishes.reorderMode.success);
      setReorderState({
        isReordering: false,
        hasChanges: false,
        isSaving: false,
      });
    } else {
      toast.error(t.error);
      setReorderState((prev) => ({ ...prev, isSaving: false }));
    }
  };

  const openDialog = (dialogType: keyof typeof dialogState, wish?: Wish) => {
    if (wish) setSelectedWish(wish);
    setDialogState((prev) => ({ ...prev, [dialogType]: true }));
  };

  const renderHeader = () => (
    <div className="w-full h-[200px] md:h-[300px] relative rounded-lg overflow-hidden border border-border">
      {coverImage && (
        <Image
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover"
          width={1000}
          height={1000}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
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
                    setDialogState((prev) => ({ ...prev, share: true }))
                  }
                >
                  <Share2 className="h-4 w-4" />
                </Button>
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

  return (
    <div className="space-y-6">
      {coverImage && renderHeader()}

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

      {/* Dialogs */}
      <CreateWishDialog
        wishlistId={wishlistId}
        open={dialogState.create}
        setOpen={(open) =>
          setDialogState((prev) => ({ ...prev, create: open }))
        }
      />
      <ShareWishlistDialog
        wishlistId={wishlistId}
        isShared={isShared}
        shareId={shareId}
        open={dialogState.share}
        setOpen={(open) => setDialogState((prev) => ({ ...prev, share: open }))}
      />
      {selectedWish && (
        <>
          <EditWishDialog
            wish={selectedWish}
            open={dialogState.edit}
            onOpenChange={(open) =>
              setDialogState((prev) => ({ ...prev, edit: open }))
            }
            setOpen={(open) =>
              setDialogState((prev) => ({ ...prev, edit: open }))
            }
          />
          <DeleteWishDialog
            id={selectedWish.id}
            wishlistId={selectedWish.wishlistId}
            open={dialogState.delete}
            onOpenChange={(open) =>
              setDialogState((prev) => ({ ...prev, delete: open }))
            }
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
    </div>
  );
}
