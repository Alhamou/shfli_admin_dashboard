"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Tv,
  User,
  Users,
  Zap,
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

  const getUserInitials = () => {
    if (user?.first_name || user?.last_name) {
      return `${user?.first_name?.charAt(0) || ""}${user?.last_name?.charAt(0) || ""}`.toUpperCase();
    }
    return user?.username?.charAt(0)?.toUpperCase() || "م";
  };

  const getUserDisplayName = () => {
    if (user?.first_name || user?.last_name) {
      return `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
    }
    return user?.username || "مدير النظام";
  };

  return (
    <Sidebar side="right" className="border-l-0">
      {/* Premium Header with Gradient */}
      <SidebarHeader className="border-b border-sidebar-border px-5 py-5 bg-gradient-to-l from-primary/5 to-transparent">
        <div className="flex items-center gap-3 rtl:space-x-reverse">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight bg-gradient-to-l from-primary to-primary/70 bg-clip-text text-transparent">
              SHFLI Admin
            </span>
            <span className="text-xs text-muted-foreground">لوحة التحكم</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        group relative rounded-xl transition-all duration-200 ease-out
                        hover:bg-sidebar-accent hover:shadow-sm
                        ${isActive
                          ? "bg-gradient-to-l from-primary/15 to-primary/5 shadow-sm border border-primary/10"
                          : ""
                        }
                      `}
                    >
                      <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                        <div className={`
                          flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200
                          ${isActive
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                            : "bg-sidebar-accent text-sidebar-foreground group-hover:bg-primary/10 group-hover:text-primary"
                          }
                        `}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className={`
                          font-medium transition-colors duration-200
                          ${isActive
                            ? "text-primary"
                            : "text-sidebar-foreground group-hover:text-foreground"
                          }
                        `}>
                          {item.title}
                        </span>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Premium Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-4 bg-gradient-to-t from-sidebar-accent/50 to-transparent">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-sm">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate">
                {getUserDisplayName()}
              </span>
              <span className="text-xs text-muted-foreground">
                {user?.roles?.includes("admin") ? "مسؤول" : "مشرف"}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="h-9 w-9 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
