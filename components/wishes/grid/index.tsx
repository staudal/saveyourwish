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
import { Share, MoveVertical, PlusCircle, ChevronDown } from "lucide-react";
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
  const [reserveDialogOpen, setReserveDialogOpen] = useState(false);
  const [removeReservationDialogOpen, setRemoveReservationDialogOpen] =
    useState(false);
  const t = useTranslations();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleReserve = (wish: Wish) => {
    setSelectedWish(wish);
    if (wish.reservation) {
      setRemoveReservationDialogOpen(true);
    } else {
      setReserveDialogOpen(true);
    }
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

    const result = await updateBulkWishPositions(wishlistId, positions);

    if (result.success) {
      toast.success(t.wishes.reorderMode.success);
      setIsReordering(false);
      setHasChanges(false);
    } else {
      toast.error(t.error);
    }

    setIsSaving(false);
  };

  const handleCancel = () => {
    setItems(wishes);
    setIsReordering(false);
    setHasChanges(false);
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

      setHasChanges(hasPositionChanges);
      return newItems;
    });
  };

  if (wishes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-semibold">{title}</h1>
          {!readonly && <CreateWishDialog wishlistId={wishlistId} />}
        </div>

        <div className="border rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium">{t.wishes.emptyState.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t.wishes.emptyState.description}
          </p>
          {!readonly && (
            <CreateWishDialog
              wishlistId={wishlistId}
              trigger={
                <Button className="mt-4">
                  {t.wishes.createDialog.trigger}
                </Button>
              }
            />
          )}
        </div>
      </div>
    );
  }

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
              open={reserveDialogOpen}
              onOpenChange={setReserveDialogOpen}
            />
            <RemoveReservationDialog
              wish={selectedWish}
              open={removeReservationDialogOpen}
              onOpenChange={setRemoveReservationDialogOpen}
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
          {isReordering ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                {t.wishes.reorderMode.cancelButton}
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                isLoading={isSaving}
                className="relative"
              >
                {t.wishes.reorderMode.saveButton}
                {hasChanges && (
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
                <ShareWishlistDialog
                  wishlistId={wishlistId}
                  isShared={isShared}
                  shareId={shareId}
                />
                {wishes.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setIsReordering(true)}
                  >
                    {t.wishes.reorderMode.button}
                  </Button>
                )}
                <CreateWishDialog wishlistId={wishlistId} />
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
                    <DropdownMenuItem>
                      <CreateWishDialog
                        wishlistId={wishlistId}
                        trigger={
                          <Button
                            variant="ghost"
                            className="w-full justify-start p-0 h-auto font-normal"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            <span>{t.wishes.createDialog.trigger}</span>
                          </Button>
                        }
                      />
                    </DropdownMenuItem>
                    {wishes.length > 0 && (
                      <DropdownMenuItem onClick={() => setIsReordering(true)}>
                        <MoveVertical className="h-4 w-4 mr-2" />
                        <span>{t.wishes.reorderMode.button}</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <ShareWishlistDialog
                        wishlistId={wishlistId}
                        isShared={isShared}
                        shareId={shareId}
                        trigger={
                          <Button
                            variant="ghost"
                            className="w-full justify-start p-0 h-auto font-normal"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Share className="h-4 w-4 mr-2" />
                            <span>{t.wishes.shareDialog.button}</span>
                          </Button>
                        }
                      />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
      </div>

      {isReordering && (
        <p className="text-muted-foreground text-sm text-center">
          {t.wishes.reorderMode.dragging}
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={rectSortingStrategy}
          disabled={!isReordering}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((wish) => (
              <WishCard
                key={wish.id}
                wish={wish}
                isReordering={isReordering}
                readonly={readonly}
                isSharedView={isShared}
                imageDimensions={imageDimensions}
                setImageDimensions={setImageDimensions}
                onDelete={handleDelete}
                onAdjustImage={handleAdjustImage}
                onEdit={handleEdit}
                onReserve={handleReserve}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {selectedWish && (
        <>
          <EditWishDialog
            wish={selectedWish}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            setOpen={setEditDialogOpen}
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
          <ReserveWishDialog
            wish={selectedWish}
            open={reserveDialogOpen}
            onOpenChange={setReserveDialogOpen}
          />
          <RemoveReservationDialog
            wish={selectedWish}
            open={removeReservationDialogOpen}
            onOpenChange={setRemoveReservationDialogOpen}
          />
        </>
      )}
    </div>
  );
}
