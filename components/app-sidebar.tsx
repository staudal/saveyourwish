"use client";

import * as React from "react";
import { Bot, Command, Gift, LifeBuoy, Send, Settings2 } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavFavorites } from "@/components/nav-favorites";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { User } from "next-auth";
import { getFavoriteWishlists } from "@/actions/wishlist";

const data = {
  navMain: [
    {
      title: "Wishlists",
      url: "/dashboard/wishlists",
      icon: Gift,
      isActive: true,
      items: [
        {
          title: "All wishlists",
          url: "/dashboard/wishlists",
        },
        {
          title: "Favorites",
          url: "/dashboard/wishlists/favorites",
        },
        {
          title: "Shared",
          url: "/dashboard/wishlists/shared",
        },
      ],
    },
    {
      title: "Inspiration",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Trending",
          url: "#",
        },
        {
          title: "Generator",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Account",
          url: "#",
        },
        {
          title: "Notifications",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "mailto:jakob@saveyourwish.com?subject=Question concerning SaveYourWish",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "mailto:jakob@saveyourwish.com?subject=Feedback concerning SaveYourWish",
      icon: Send,
    },
  ],
};

interface Props {
  user: User;
  favorites: Awaited<ReturnType<typeof getFavoriteWishlists>>;
}

export function AppSidebar({
  user,
  favorites,
  ...props
}: Props & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">saveyourwish</span>
                  <span className="truncate text-xs">Home</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavFavorites
          favorites={(favorites ?? []).map((favorite) => ({
            name: favorite.title,
            url: `/dashboard/wishlists/${favorite.id}`,
            icon: Gift,
            id: favorite.id,
          }))}
        />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
