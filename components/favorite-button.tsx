"use client";

import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { toggleWishlistFavorite } from "@/actions/wishlist";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import React from "react";

interface FavoriteButtonProps {
  id: string;
  favorite: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const FavoriteButton = React.forwardRef<
  HTMLButtonElement,
  FavoriteButtonProps
>(({ id, favorite, children, className }, ref) => {
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
      ref={ref}
      variant="ghost"
      size={children ? "default" : "icon"}
      className={cn(children && "w-full justify-start", className)}
      onClick={handleClick}
    >
      {children || (
        <Star className={favorite ? "fill-yellow-400" : ""} size={16} />
      )}
    </Button>
  );
});

FavoriteButton.displayName = "FavoriteButton";
