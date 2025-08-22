import { Edit, Loader2, MessageCircle, Save, X } from "lucide-react";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";
import { ICreatMainItem } from "@/interfaces";
import { SendNotificationPopup } from "./SendNotificationPopup";
import { toast } from "sonner";
import { sendNotTeam, updateItem } from "@/services/restApiServices";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

export const ViewItemActions = ({
  handleEditToggle,
  isEditing,
  handleSave,
  editedFields,
  updatingStatus,
  item,
  fetchItem,
  onItemUpdate,
}: {
  handleEditToggle: () => void;
  isEditing: boolean;
  handleSave: () => void;
  editedFields: Partial<ICreatMainItem>;
  updatingStatus: boolean;
  item: ICreatMainItem;
  fetchItem: (uuid: string) => Promise<ICreatMainItem | undefined>;
  onItemUpdate: (updatedItem: ICreatMainItem) => void;
}) => {
  const { t } = useTranslation();
  const [loading, setIsloading] = useState(false);
  const [convertingToSale, setConvertingToSale] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleConvertToSale = async () => {
    setShowConfirmDialog(false);
    setConvertingToSale(true);
    try {
      await updateItem(item.uuid, {
        is_active: "active",
        item_for: "sale",
        status_note: null,
        bid_end_time: null,
        bid_status: null,
        bids: "[]"
      });
      toast.success(t("messages.convertToSaleSuccess"));
      const updatedItem = await fetchItem(item.uuid);
      if (updatedItem) {
        onItemUpdate(updatedItem);
      }
    } catch (error) {
      toast.error(t("messages.convertToSaleError"));
    } finally {
      setConvertingToSale(false);
    }
  };

  const openConfirmDialog = () => {
    setShowConfirmDialog(true);
  };

  const closeConfirmDialog = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
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
        {item?.item_for === "bid" && (
          <Button
            onClick={openConfirmDialog}
            variant="outline"
            disabled={convertingToSale || updatingStatus}
            className="w-full sm:w-auto"
          >
            {convertingToSale ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {t("dialog.buttons.convertToSale")}
          </Button>
        )}
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("convertToSaleConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("convertToSaleConfirm.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeConfirmDialog}>
              {t("dialog.buttons.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConvertToSale}>
              {t("dialog.buttons.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
