"use client";

import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { toggleWishlistFavorite } from "@/actions/wishlist";

interface FavoriteButtonProps {
  id: string;
  favorite: boolean;
}

export function FavoriteButton({ id, favorite }: FavoriteButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => toggleWishlistFavorite(id)}
      title={favorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Star className={favorite ? "fill-yellow-400" : ""} size={16} />
    </Button>
  );
}
