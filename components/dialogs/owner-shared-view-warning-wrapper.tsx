"use client";

import { useState } from "react";
import { OwnerSharedViewWarningDialog } from "./owner-shared-view-warning-dialog";

export function OwnerSharedViewWarningWrapper({
  wishlistId,
}: {
  wishlistId: string;
}) {
  const [open, setOpen] = useState(true);

  return (
    <OwnerSharedViewWarningDialog
      open={open}
      onOpenChange={setOpen}
      wishlistId={wishlistId}
    />
  );
}
