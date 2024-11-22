"use client";

import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { toggleWishlistFavorite } from "@/actions/wishlist";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  id: string;
  favorite: boolean;
}

export function FavoriteButton({ id, favorite }: FavoriteButtonProps) {
  const { toast } = useToast();
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const result = await toggleWishlistFavorite(id);
    if (result.success) {
      toast({
        title: favorite ? "Removed from favorites" : "Added to favorites",
        description: favorite
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
      variant="ghost"
      size="icon"
      onClick={handleClick}
      title={favorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Star className={favorite ? "fill-yellow-400" : ""} size={16} />
    </Button>
  );
}
