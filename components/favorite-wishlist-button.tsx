"use client";

import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { toggleWishlistFavorite } from "@/actions/wishlist";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface FavoriteWishlistButtonProps {
  wishlistId: string;
  isFavorite: boolean;
}

export function FavoriteWishlistButton({
  wishlistId,
  isFavorite,
}: FavoriteWishlistButtonProps) {
  const { toast } = useToast();
  const router = useRouter();

  const handleToggleFavorite = async () => {
    const result = await toggleWishlistFavorite(wishlistId);
    if (result.success) {
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: isFavorite
          ? "Wishlist removed from favorites"
          : "Wishlist added to favorites",
      });
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
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
