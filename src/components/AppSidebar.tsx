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
            title: "المدراء",
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
    <Sidebar side="right" className="border-l-0 shadow-2xl">
      <SidebarHeader className="px-6 py-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-blue-600 shadow-xl shadow-primary/30 ring-4 ring-primary/10">
            <Zap className="h-6 w-6 text-primary-foreground animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight bg-gradient-to-l from-primary to-blue-600 bg-clip-text text-transparent">
              SHFLI
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
              Admin Dashboard
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        group relative h-12 rounded-2xl transition-all duration-300 ease-in-out px-4
                        hover:bg-primary/5 active:scale-95
                        ${isActive
                          ? "bg-primary/10 shadow-sm border border-primary/20"
                          : "bg-transparent border border-transparent"
                        }
                      `}
                    >
                      <Link to={item.url} className="flex items-center gap-4 w-full">
                        <div className={`
                          flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300
                          ${isActive
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 rotate-3"
                            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-hover:-rotate-3"
                          }
                        `}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <span className={`
                          text-sm font-bold transition-colors duration-300
                          ${isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground"
                          }
                        `}>
                          {item.title}
                        </span>

                        {isActive && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-l-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
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

      <SidebarFooter className="p-6 mt-auto">
        <div className="relative group overflow-hidden rounded-3xl bg-muted/30 p-4 border border-border/50 transition-all duration-300 hover:bg-muted/50 hover:shadow-lg">
          <div className="flex items-center gap-4 relative z-10">
            <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-md transition-transform duration-300 group-hover:scale-105">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent text-primary font-black text-lg">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-bold truncate text-foreground leading-tight">
                {getUserDisplayName()}
              </span>
              <span className="text-xs font-semibold text-muted-foreground/80 bg-primary/5 px-2 py-0.5 rounded-full w-fit mt-1 border border-primary/10 uppercase tracking-tighter">
                {user?.roles?.includes("admin") ? "Administrator" : "Moderator"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all duration-300 group-hover:rotate-12"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>

          {/* Subtle background decoration */}
          <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
