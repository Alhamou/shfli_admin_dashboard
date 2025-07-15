import { Button } from "@/components/ui/button";
import { SendNotificationPopup } from "@/components/SendNotificationPopup";
import { AnnouncementDialog } from "@/components/FirebaseAnnouncement";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { sendFirebase, sendNotAdmin } from "@/services/restApiServices";
import { connectSocket, socket } from "@/controllers/requestController";

export function Admin() {
  const { t } = useTranslation();
  const [loadingNotification, setLoadingNotification] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const handleSendNotification = async (messageData: any) => {
    setLoadingNotification(true);
    try {
      // Replace with your actual notification sending logic
      await sendNotAdmin(messageData);
      toast.success(t("notificationPopup.NotificationSuccess"));
    } catch {
      toast.error(t("notificationPopup.NotificationError"));
    } finally {
      setLoadingNotification(false);
    }
  };

  const handleSendAnnouncement = async (data: {
    title: string;
    description: string;
  }) => {
    await sendFirebase(data);
  };

  useEffect(() => {
    // Connect with error handling
    connectSocket();

    // Debug events
    const onConnect = () => {
      console.log("Connected socket");
      setIsSocketConnected(true);
    };

    const onDisconnect = () => {
      console.log("Socket disconnected");
      setIsSocketConnected(false);
    };

    const onError = (err: Error) => {
      console.error("Socket error:", err.message);
      setIsSocketConnected(false);
    };

    const onMessage = (message: any) => {
      console.log("new item received", message);
    };

    // Connection check interval
    const checkConnectionInterval = setInterval(() => {
      if (!socket.connected) {
        console.log("Socket disconnected, attempting to reconnect...");
        socket.connect();
      }
    }, 5000); // Check every 5 seconds

    // Setup event listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onError);
    socket.on("log_data", onMessage);

    return () => {
      // Cleanup
      clearInterval(checkConnectionInterval);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onError);
      socket.off("log_data", onMessage);
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 justify-between">
      <SendNotificationPopup
        is_public={true}
        userId={1}
        loading={loadingNotification}
        onSend={handleSendNotification}
      >
        <Button
          variant="outline"
          className="h-14 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-lg font-semibold"
        >
          {t("notificationPopup.publicTitle")}
        </Button>
      </SendNotificationPopup>

      <AnnouncementDialog onSend={handleSendAnnouncement}>
        <Button className="mx-8 h-14 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-lg font-semibold">
          <span>{t("announcement.button")}</span>
        </Button>
      </AnnouncementDialog>
    </div>
  );
}
