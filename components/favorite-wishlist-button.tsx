"use client";

import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { toggleWishlistFavorite } from "@/actions/wishlist";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface FavoriteWishlistButtonProps {
  wishlistId: string;
  isFavorite: boolean;
}

export function FavoriteWishlistButton({
  wishlistId,
  isFavorite,
}: FavoriteWishlistButtonProps) {
  const router = useRouter();

  const handleToggleFavorite = async () => {
    await toast.promise(toggleWishlistFavorite(wishlistId), {
      loading: isFavorite
        ? "Removing from favorites..."
        : "Adding to favorites...",
      success: (result) => {
        if (result.success) {
          router.refresh();
          return isFavorite
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
      variant="outline"
      onClick={handleToggleFavorite}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Star className={`mr-2 h-4 w-4 ${isFavorite ? "fill-yellow-400" : ""}`} />
      {isFavorite ? "Unfavorite" : "Favorite"}
    </Button>
  );
}
