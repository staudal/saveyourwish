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
import { ArrowUpDown, ChevronDown, CirclePlus, Share } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReserveWishDialog } from "@/components/dialogs/reserve-wish-dialog";
import { RemoveReservationDialog } from "@/components/dialogs/remove-reservation-dialog";
import { Wish } from "./types";

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
  const [reorderState, setReorderState] = useState({
    isReordering: false,
    hasChanges: false,
    isSaving: false,
  });
  const [dialogState, setDialogState] = useState({
    edit: false,
    delete: false,
    imagePosition: false,
    create: false,
    reserve: false,
    removeReservation: false,
    share: false,
  });
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const [imageDimensions, setImageDimensions] = useState<
    Record<string, ImageDimension>
  >({});

  const t = useTranslations();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const openDialog = (dialogType: keyof typeof dialogState, wish?: Wish) => {
    if (wish) setSelectedWish(wish);
    setDialogState((prev) => ({ ...prev, [dialogType]: true }));
  };

  const handleReserve = (wish: Wish) => {
    setSelectedWish(wish);
    openDialog(wish.reservation ? "removeReservation" : "reserve");
  };

  useEffect(() => {
    if (!reorderState.isReordering) {
      setItems(wishes);
      setReorderState((prev) => ({ ...prev, hasChanges: false }));
    }
  }, [wishes, reorderState.isReordering]);

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

  const handleCancel = () => {
    setItems(wishes);
    setReorderState({
      isReordering: false,
      hasChanges: false,
      isSaving: false,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setItems((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);

      const hasPositionChanges = newItems.some((item, index) => {
        return wishes[index]?.id !== item.id;
      });

      setReorderState((prev) => ({ ...prev, hasChanges: hasPositionChanges }));
      return newItems;
    });
  };

  if (readonly) {
    return (
      <div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wishes.map((wish) => (
            <WishCard
              key={wish.id}
              wish={wish}
              readonly
              isSharedView={isShared}
              imageDimensions={imageDimensions}
              setImageDimensions={setImageDimensions}
              onReserve={handleReserve}
            />
          ))}
        </div>

        {selectedWish && (
          <>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-semibold">{title}</h1>
        <div className="flex items-center gap-2">
          {reorderState.isReordering ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={reorderState.isSaving}
              >
                {t.wishes.reorderMode.cancelButton}
              </Button>
              <Button
                onClick={handleSave}
                disabled={!reorderState.hasChanges || reorderState.isSaving}
                isLoading={reorderState.isSaving}
                className="relative"
              >
                {t.wishes.reorderMode.saveButton}
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
              {/* Show buttons on desktop */}
              <div className="hidden lg:flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setDialogState((prev) => ({ ...prev, share: true }))
                  }
                >
                  {t.wishes.shareDialog.button}
                </Button>
                {wishes.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      setReorderState((prev) => ({
                        ...prev,
                        isReordering: true,
                      }))
                    }
                  >
                    {t.wishes.reorderMode.button}
                  </Button>
                )}
                <Button
                  onClick={() =>
                    setDialogState((prev) => ({ ...prev, create: true }))
                  }
                >
                  {t.wishes.createDialog.trigger}
                </Button>
              </div>

              {/* Show dropdown on mobile */}
              <div className="lg:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      {t.wishes.actions.manage}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>
                      {t.wishes.actions.manage}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        setDialogState((prev) => ({ ...prev, create: true }))
                      }
                    >
                      <CirclePlus className="h-4 w-4" />
                      <span>{t.wishes.createDialog.trigger}</span>
                    </DropdownMenuItem>
                    {wishes.length > 0 && (
                      <DropdownMenuItem
                        onClick={() =>
                          setReorderState((prev) => ({
                            ...prev,
                            isReordering: true,
                          }))
                        }
                      >
                        <ArrowUpDown className="h-4 w-4" />
                        <span>{t.wishes.reorderMode.button}</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() =>
                        setDialogState((prev) => ({ ...prev, share: true }))
                      }
                    >
                      <Share className="h-4 w-4" />
                      <span>{t.wishes.shareDialog.button}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
      </div>

      {reorderState.isReordering && (
        <p className="text-muted-foreground text-sm text-center">
          {t.wishes.reorderMode.dragging}
        </p>
      )}

      {wishes.length === 0 && (
        <div className="border rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium">{t.wishes.emptyState.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t.wishes.emptyState.description}
          </p>
          {!readonly && (
            <Button
              className="mt-4"
              onClick={() =>
                setDialogState((prev) => ({ ...prev, create: true }))
              }
            >
              {t.wishes.createDialog.trigger}
            </Button>
          )}
        </div>
      )}

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
                onReserve={handleReserve}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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
