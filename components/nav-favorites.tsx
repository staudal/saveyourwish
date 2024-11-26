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
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const { toast } = useToast();
  const router = useRouter();

  const handleUnfavorite = async (id: string) => {
    const result = await toggleWishlistFavorite(id);
    if (result.success) {
      toast({
        title: "Removed from favorites",
        description: "Wishlist removed from favorites",
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
