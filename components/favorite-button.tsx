"use client";

import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { toggleWishlistFavorite } from "@/actions/wishlist";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface FavoriteButtonProps {
  id: string;
  favorite: boolean;
}

export function FavoriteButton({ id, favorite }: FavoriteButtonProps) {
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    await toast.promise(toggleWishlistFavorite(id), {
      loading: favorite
        ? "Removing from favorites..."
        : "Adding to favorites...",
      success: (result) => {
        if (result.success) {
          router.refresh();
          return favorite
            ? "Wishlist removed from favorites"
            : "Wishlist added to favorites";
        }
        throw new Error(result.error || "Failed to update favorite status");
      },
      error: (err) => err.message || "Failed to update favorite status",
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      title={favorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Star className={favorite ? "fill-yellow-400" : ""} size={16} />
    </Button>
  );
}
