"use client";

import * as React from "react";
import Image from "next/image";
import { LifeBuoy, List, Send, Settings2 } from "lucide-react";
import { User } from "next-auth";

import { NavMain } from "@/components/nav-main";
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
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const { setOpenMobile } = useSidebar();
  const data = {
    navMain: [
      {
        title: "Wishlists",
        url: "/dashboard/wishlists",
        icon: List,
      },
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings2,
      },
    ],
    navSecondary: [
      {
        title: "Support",
        url: "mailto:jakob@saveyourwish.com?subject=Support",
        icon: LifeBuoy,
      },
      {
        title: "Feedback",
        url: "mailto:jakob@saveyourwish.com?subject=Feedback",
        icon: Send,
      },
    ],
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link
                href="/dashboard/wishlists"
                onClick={() => setOpenMobile(false)}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Image
                    src="/logo_white.svg"
                    alt="SaveYourWish"
                    width={20}
                    height={20}
                    className="size-5"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">SaveYourWish</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
