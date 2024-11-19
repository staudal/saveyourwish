"use client";

import * as React from "react";
import {
  Bot,
  Command,
  Frame,
  Gift,
  LifeBuoy,
  PieChart,
  Send,
  Settings2,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
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

const data = {
  user: {
    name: "Jakob",
    email: "jakobstaudal@outlook.com",
  },
  navMain: [
    {
      title: "Wishlists",
      url: "#",
      icon: Gift,
      isActive: true,
      items: [
        {
          title: "All wishlists",
          url: "#",
        },
        {
          title: "Favorites",
          url: "#",
        },
        {
          title: "Shared",
          url: "#",
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
  projects: [
    {
      name: "Birthday 2024",
      url: "#",
      icon: Frame,
    },
    {
      name: "Christmas 2024",
      url: "#",
      icon: PieChart,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
