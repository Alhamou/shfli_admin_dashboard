import { Button } from "@/components/ui/button";
import { Megaphone, MessageCircle } from "lucide-react";
import { SendNotificationPopup } from "@/components/SendNotificationPopup";
import { AnnouncementDialog } from "@/components/FirebaseAnnouncement";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { toast } from "sonner";
import { sendFirebase, sendNotAdmin } from "@/services/restApiServices";

export function Admin() {
  const { t } = useTranslation();
  const [loadingNotification, setLoadingNotification] = useState(false);

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
