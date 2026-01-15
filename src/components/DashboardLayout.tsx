import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { DashboardHeader } from "./DashboardHeader";

export default function DashboardLayout() {

  return (
    <SidebarProvider>
      <div
        className="flex min-h-screen flex-row flex-grow"
        style={{
          direction: "rtl",
          textAlign: "right",
        }}
      >
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-2 bg-gray-50 dark:bg-gray-900">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
