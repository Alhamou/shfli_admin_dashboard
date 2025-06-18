import { Outlet } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { DashboardHeader } from "./dashboard-header"
import { useEffect } from "react";
import { connectSocket, socket } from "@/controllers/requestController";
import storageController from "@/controllers/storageController";

export default function DashboardLayout() {

   useEffect(() => {
    // Connect to socket (pass token if needed)
    connectSocket(storageController.get('token')!);

    // Set up event listeners
    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("message", (message) => {
      console.log(message)
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    // Clean up on unmount
    return () => {
      socket.off("connect");
      socket.off("newMessage");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
