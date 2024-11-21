"use client";

import {
  Folder,
  MoreHorizontal,
  Share,
  Star,
  type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import React from "react";
import { toggleWishlistFavorite } from "@/actions/wishlist";

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
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Favorites</SidebarGroupLabel>
      <SidebarMenu>
        {favorites.length > 0 ? (
          favorites.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.name}</span>
                </a>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem asChild>
                    <a href={item.url}>
                      <Folder className="text-muted-foreground" />
                      <span>View</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share className="text-muted-foreground" />
                    <span>Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => toggleWishlistFavorite(item.id)}
                  >
                    <Star className="text-muted-foreground" />
                    <span>Unfavorite</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
