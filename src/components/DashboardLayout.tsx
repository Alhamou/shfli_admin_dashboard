import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { DashboardHeader } from "./DashboardHeader";

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div
        className="flex min-h-screen w-full flex-row bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-foreground"
        style={{
          direction: "rtl",
          textAlign: "right",
        }}
      >
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-8 lg:p-10">
            <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
