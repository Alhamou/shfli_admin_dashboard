import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { SendNotificationPopup } from '@/components/SendNotificationPopup';
import { AnnouncementDialog } from '@/components/FirebaseAnnouncement';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { toast } from 'sonner';
import { sendFirebase, sendNotAdmin } from '@/services/restApiServices';

export function Admin() {
  const { t } = useTranslation();
  const [loadingNotification, setLoadingNotification] = useState(false);

  const handleSendNotification = async (messageData: any) => {
    setLoadingNotification(true);
    try {
      // Replace with your actual notification sending logic
      await sendNotAdmin(messageData);
      toast.success(t('notificationPopup.NotificationSuccess'));
    } catch {
      toast.error(t('notificationPopup.NotificationError'));
    } finally {
      setLoadingNotification(false);
    }
  };

  const handleSendAnnouncement = async (data: { title: string; description: string }) => {
    await sendFirebase(data);
  };

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
      <SendNotificationPopup
        is_public={true}
        userId={1}
        loading={loadingNotification}
        onSend={handleSendNotification}
      >
        <Button variant="outline" className="flex-1 lg:flex-none">
          <MessageCircle className="mr-2 h-4 w-4" />
          {t('notificationPopup.publicTitle')}
        </Button>
      </SendNotificationPopup>

      <AnnouncementDialog onSend={handleSendAnnouncement} />
    </div>
  );
}