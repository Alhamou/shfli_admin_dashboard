"use client";

import { Button } from "@/components/ui/button";
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
import {
  AlertCircle,
  ChartColumnIncreasing,
  Gavel,
  Home,
  LogOut,
  MessageCircle,
  Settings,
  Shield,
  Tv,
  User,
  Users,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../app";

export function AppSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();


  const menuItems = [
    {
      title: "أحدث الإعلانات",
      url: "/",
      icon: Home,
    },
    {
      title: "الإعلانات المروجة",
      url: "/commercialAds",
      icon: Tv,
    },
    {
      title: "المستخدمين",
      url: "/users",
      icon: Users,
    },
    {
      title: "مزايدات",
      url: "/bids",
      icon: Gavel,
    },
    {
      title: "معلق",
      url: "/pending",
      icon: AlertCircle,
    },
    ...(user?.roles.includes("admin")
      ? [
          {
            title: "ادمن",
            url: "/admin",
            icon: User,
          },
        ]
      : []),
    {
      title: "المحادثات",
      url: "/chats",
      icon: MessageCircle,
    },
    {
      title: "إحصائيات",
      url: "/statistics",
      icon: ChartColumnIncreasing,
    },
    {
      title: "الإعدادات",
      url: "/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar side="right">
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
                      <span>{item.title}</span>
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
            <span className="text-sm font-medium">
              {user?.first_name || user?.last_name
                ? `${user?.first_name || ""} ${user?.last_name || ""}`.trim()
                : user?.username || "مدير النظام"}
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
