"use client";

import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "../../app";
import {
  Home,
  Users,
  Settings,
  Shield,
  LogOut,
  MessageCircle,
  Tv,
  ChartColumnIncreasing,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function AppSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t,i18n } = useTranslation();

  const menuItems = [
    {
      title: "dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "commercialAds",
      url: "/commercialAds",
      icon: Tv,
    },
    {
      title: "users",
      url: "/users",
      icon: Users,
    },
    ...(user?.roles.includes("admin")
      ? [
          {
            title: "admin",
            url: "/admin",
            icon: User,
          },
        ]
      : []),
    {
      title: "chats",
      url: "/chats",
      icon: MessageCircle,
    },
    {
      title: "statistics",
      url: "/statistics",
      icon: ChartColumnIncreasing,
    },
    {
      title: "settings",
      url: "/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar side={i18n.language === 'ar' ? "right" : 'left'}>
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">SHFLI Admin</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{t(`sidebar.${item.title}`)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.uuid}</span>
            <span className="text-xs text-muted-foreground">
              {user?.phone_number}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
