"use client";

import { Button } from "@/components/ui/button";

interface ReorderWishesProps {
  isReordering: boolean;
  setIsReordering: (isReordering: boolean) => void;
  onSaveOrder: () => Promise<void>;
  hasOrderChanged: boolean;
  isSaving: boolean;
}

export function ReorderWishes({
  isReordering,
  setIsReordering,
  onSaveOrder,
  hasOrderChanged,
  isSaving,
}: ReorderWishesProps) {
  const handleCancel = () => {
    if (!isSaving) {
      setIsReordering(false);
    }
  };

  return (
    <>
      {isReordering ? (
        <>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onSaveOrder} disabled={isSaving || !hasOrderChanged}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </>
      ) : (
        <Button variant="outline" onClick={() => setIsReordering(true)}>
          Reorder
        </Button>
      )}
    </>
  );
}
