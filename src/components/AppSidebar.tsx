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
  useSidebar,
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
import { useAuth } from "../context/AuthContext";

export function AppSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { setOpenMobile } = useSidebar();

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
    {
      title: "إدارة البيانات",
      url: "/all_resources",
      icon: Zap,
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
    <Sidebar side="right" className="border-l-0 shadow-2xl bg-gradient-to-b from-indigo-600 via-indigo-700 to-blue-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <SidebarHeader className="px-6 py-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xl shadow-black/20 ring-4 ring-white/20 overflow-hidden">
            <img src="/shfli-logo.png" alt="SHFLI Logo" className="h-10 w-10 object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-white">
              SHFLI
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">
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
                      onClick={() => setOpenMobile(false)}
                      className={`
                        group relative h-12 rounded-2xl transition-all duration-300 ease-in-out px-4
                        hover:bg-white/10 active:scale-95
                        ${isActive
                          ? "bg-white dark:bg-slate-700 shadow-lg border border-white/30 dark:border-slate-600"
                          : "bg-transparent border border-transparent"
                        }
                      `}
                    >
                      <Link to={item.url} className="flex items-center gap-4 w-full">
                        <div className={`
                          flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300
                          ${isActive
                            ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg rotate-3"
                            : "bg-white/10 text-white group-hover:bg-white/20 group-hover:-rotate-3"
                          }
                        `}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <span className={`
                          text-sm font-bold transition-colors duration-300
                          ${isActive
                            ? "text-indigo-600 dark:text-white"
                            : "text-indigo-100 group-hover:text-white"
                          }
                        `}>
                          {item.title}
                        </span>

                        {isActive && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-600 dark:bg-indigo-500 rounded-l-full shadow-lg" />
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

      <SidebarFooter className="p-4 mt-auto">
        <div className="flex flex-col gap-3">
          <div className="relative group overflow-hidden rounded-[1.5rem] bg-white/10 p-4 border border-white/10 transition-all duration-300 hover:bg-white/15">
            <div className="flex items-center gap-3 relative z-10 w-full mb-1">
              <Avatar className="h-11 w-11 border-2 border-white/30 shadow-md shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black text-base">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-black truncate text-white leading-tight">
                  {getUserDisplayName()}
                </span>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full w-fit mt-1 border border-amber-500/30 uppercase tracking-tighter">
                  {user?.roles?.includes("admin") ? "Administrator" : "Moderator"}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={logout}
            className="w-full h-11 rounded-xl bg-red-500/20 hover:bg-red-500 hover:text-white text-red-200 font-black text-xs flex items-center justify-center gap-3 transition-all duration-300 group border border-red-500/30"
          >
            <LogOut className="h-4 w-4 transition-transform group-hover:rotate-12" />
            <span>تسجيل الخروج</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
