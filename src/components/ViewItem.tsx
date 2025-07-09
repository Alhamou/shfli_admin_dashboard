import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ICreatMainItem } from "@/interfaces";
import { getItem, updateItem, getReasons } from "@/services/restApiServices";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { ViewItemMiddleColumn } from "./ViewItemMiddleColumn";
import { ViewItemActions } from "./ViewItemActions";
import { ViewItemImages } from "./ViewItemImages";
import { ViewItemFooter } from "./ViewItemFooter";

interface ItemDetailViewProps {
  uuid: string;
  open: boolean;
  onClose: () => void;
  onStatusChange?: () => void;
  onItemUpdate: (updatedItem: ICreatMainItem) => void;
}

export function ItemDetailView({
  uuid,
  open,
  onClose,
  onStatusChange,
  onItemUpdate,
}: ItemDetailViewProps) {
  const { t } = useTranslation();
  const [item, setItem] = useState<ICreatMainItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [blockReasons, setBlockReasons] = useState<string[]>([]);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState<Partial<ICreatMainItem>>({});
  const [originalItem, setOriginalItem] = useState<ICreatMainItem | null>(null);

  const fetchItem = async (uuid: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getItem(uuid);
      setItem(data[0]);
      setOriginalItem(data[0]);
      return data[0];
    } catch (err) {
      setError(t("messages.loadingError"));
      toast.error(t("messages.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false);
      setEditedFields({});
      if (originalItem) setItem(originalItem);
    } else {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!item || !originalItem || Object.keys(editedFields).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      await updateItem(item.uuid, editedFields);
      toast.success(t("messages.updateSuccess"));
      setIsEditing(false);
      setOriginalItem(item);
      setEditedFields({});
      const updatedItem = await fetchItem(uuid);
      if (updatedItem) {
        onItemUpdate(updatedItem);
      }
    } catch (error) {
      toast.error(t("messages.updateError"));
    }
  };

  const fetchBlockReasons = async () => {
    setLoading(true);
    try {
      const response = await getReasons();
      setBlockReasons(item?.item_as === "job" ? response.jobs : response.items);
    } catch (err) {
      toast.error(t("messages.reasonsError"));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (newStatus: "active" | "blocked") => {
    if (!item) return;

    setUpdatingStatus(true);
    try {
      let description: string | null = item.description;

      if (newStatus === "blocked") {
        description = `${
          selectedReason === t("dialog.messages.blockReason.other")
            ? customReason
            : selectedReason
        }`;
      } else {
        description = null;
      }

      await updateItem(item.uuid, {
        status_note: description,
        is_active: newStatus,
      });

      toast.success(
        t("messages.statusUpdateSuccess", {
          status: t(
            `messages.status${
              newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
            }`
          ),
        })
      );

      const updatedItem = await fetchItem(item.uuid);
      if (updatedItem) {
        onItemUpdate(updatedItem);
      }
    } catch (err) {
      toast.error(t("messages.statusUpdateError"));
    } finally {
      setUpdatingStatus(false);
      setShowReasonInput(false);
      setSelectedReason("");
      setCustomReason("");
    }
  };

  const handleBlockAction = () => {
    if (item?.is_active === "active") {
      setShowReasonInput(true);
    } else {
      handleStatusToggle("active");
    }
  };

  useEffect(() => {
    if (open) {
      fetchItem(uuid);
      fetchBlockReasons();
      setShowReasonInput(false);
      setSelectedReason("");
      setCustomReason("");
    } else {
      setItem(null);
    }
    setIsEditing(false);
  }, [open, uuid]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] lg:max-w-[90vw] xl:max-w-[85vw] w-full max-h-[100vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader></DialogHeader>
        <DialogTitle></DialogTitle>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="sr-only">{t("dialog.messages.loading")}</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            {error}
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                fetchItem(uuid);
              }}
            >
              {t("dialog.buttons.retry")}
            </Button>
          </div>
        ) : item ? (
          <div
            className={`flex flex-col ${
              i18n.language === "ar" ? "lg:flex-row-reverse" : "lg:flex-row"
            }`}
          >
            {/* Left Column - Images */}
            <ViewItemImages item={item} />

            {/* Middle Column - Details */}

            <ViewItemMiddleColumn
              isEditing={isEditing}
              item={item}
              editedFields={editedFields}
              originalItem={originalItem}
              setEditedFields={setEditedFields}
              setItem={setItem}
            />

            {/* Right Column - Actions */}
            <ViewItemActions
              editedFields={editedFields}
              handleEditToggle={handleEditToggle}
              handleSave={handleSave}
              isEditing={isEditing}
              updatingStatus={updatingStatus}
              item={item}
            />
          </div>
        ) : null}
        <ViewItemFooter
          blockReasons={blockReasons}
          customReason={customReason}
          handleBlockAction={handleBlockAction}
          handleStatusToggle={handleStatusToggle}
          item={item}
          selectedReason={selectedReason}
          setCustomReason={setCustomReason}
          setSelectedReason={setSelectedReason}
          setShowReasonInput={setShowReasonInput}
          showReasonInput={showReasonInput}
          updatingStatus={updatingStatus}
        />
      </DialogContent>
    </Dialog>
  );
}
