import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { useTranslation } from "react-i18next";

export default function DashboardLayout() {
  const { i18n } = useTranslation();
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main
            className="flex-1 p-6 bg-gray-50 dark:bg-gray-900"
            style={{ direction: i18n.language === "ar" ? "rtl" : "ltr" }}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
