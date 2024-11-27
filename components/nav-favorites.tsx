"use client";

import { Star, type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import React from "react";
import { toggleWishlistFavorite } from "@/actions/wishlist";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export function NavFavorites({
  favorites,
}: {
  favorites: {
    name: string;
    url: string;
    icon: LucideIcon;
    id: string;
  }[];
}) {
  const router = useRouter();

  const handleUnfavorite = async (id: string) => {
    await toast.promise(toggleWishlistFavorite(id), {
      loading: "Removing from favorites...",
      success: (result) => {
        if (result.success) {
          router.refresh();
          return "Wishlist removed from favorites";
        }
        throw new Error(result.error || "Failed to remove from favorites");
      },
      error: (err) => err.message || "Failed to remove from favorites",
    });
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Favorites</SidebarGroupLabel>
      <SidebarMenu>
        {favorites.length > 0 ? (
          favorites.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuAction
                showOnHover
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleUnfavorite(item.id);
                }}
                title="Remove from favorites"
              >
                <Star className="fill-yellow-400" />
              </SidebarMenuAction>
            </SidebarMenuItem>
          ))
        ) : (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            No favorites yet
          </div>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
