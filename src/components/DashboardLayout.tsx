import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { DashboardHeader } from "./DashboardHeader";

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div
        className="flex min-h-screen flex-row flex-grow bg-gradient-to-br from-background via-background to-muted/30"
        style={{
          direction: "rtl",
          textAlign: "right",
        }}
      >
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <div className="mx-auto max-w-[1600px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
