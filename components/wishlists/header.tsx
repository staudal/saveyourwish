"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { WishlistDialog } from "../dialogs/wishlist-dialog";

export default function WishlistHeader() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Wishlists</h1>
      <Button onClick={() => setOpen(true)}>Create Wishlist</Button>
      <WishlistDialog mode="create" open={open} setOpen={setOpen} />
    </div>
  );
}
