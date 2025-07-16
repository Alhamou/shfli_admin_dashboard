import { Edit, MessageCircle, Save, X } from "lucide-react";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";
import { ICreatMainItem } from "@/interfaces";
import { SendNotificationPopup } from "./SendNotificationPopup";
import { toast } from "sonner";
import { sendNotTeam } from "@/services/restApiServices";
import { useState } from "react";

export const ViewItemActions = ({
  handleEditToggle,
  isEditing,
  handleSave,
  editedFields,
  updatingStatus,
  item,
}: {
  handleEditToggle: () => void;
  isEditing: boolean;
  handleSave: () => void;
  editedFields: Partial<ICreatMainItem>;
  updatingStatus: boolean;
  item: ICreatMainItem;
}) => {
  const { t } = useTranslation();
  const [loading, setIsloading] = useState(false);
  return (
    <div className="flex flex-row md:flex-col lg:min-w-32 lg:max-w-40 min-w-full mx-8">
      {isEditing ? (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditToggle}
            className="flex-1 sm:flex-none"
          >
            <X className="h-4 w-4 mr-2" /> {t("dialog.buttons.cancel")}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={Object.keys(editedFields).length === 0}
            className="flex-1 sm:flex-none"
          >
            <Save className="h-4 w-4 mr-2" /> {t("dialog.buttons.save")}
          </Button>
        </>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleEditToggle}
          className="flex-1 sm:flex-none"
        >
          <Edit className="h-4 w-4 mr-2" /> {t("dialog.buttons.edit")}
        </Button>
      )}

      <SendNotificationPopup
        is_public={false}
        userId={item.user_id}
        loading={loading}
        item={item}
        onSend={async (messageData) => {
          setIsloading(true);
          try {
            await sendNotTeam(messageData);
            toast.success(t("notificationPopup.NotificationSuccess"));
          } catch {
            toast.error(t("notificationPopup.NotificationError"));
          } finally {
            setIsloading(false);
          }
        }}
      >
        <Button variant="outline" className="flex-1 lg:flex-none">
          <MessageCircle /> {t("dialog.buttons.message")}
        </Button>
      </SendNotificationPopup>

      <Button variant="outline" className="flex-1 lg:flex-none">
        {t("dialog.buttons.share")}
      </Button>
      <Button
        variant="outline"
        className="flex-1 lg:flex-none"
        disabled={updatingStatus}
      >
        {t("dialog.buttons.report")}
      </Button>
    </div>
  );
};
