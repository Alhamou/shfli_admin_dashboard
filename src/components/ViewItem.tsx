import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ICreatMainItem } from "@/interfaces";
import { getItem, getReasons, updateItem } from "@/services/restApiServices";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ViewItemActions } from "./ViewItemActions";
import { ViewItemFooter } from "./ViewItemFooter";
import { ViewItemImages } from "./ViewItemImages";
import { ViewItemMiddleColumn } from "./ViewItemMiddleColumn";

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
      setError("خطأ في تحميل البيانات");
      toast.error("فشل في جلب المنشور");
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
      toast.success("تم تحديث المنشور بنجاح");
      setIsEditing(false);
      setOriginalItem(item);
      setEditedFields({});
      const updatedItem = await fetchItem(uuid);
      if (updatedItem) {
        onItemUpdate(updatedItem);
      }
    } catch (error) {
      toast.error("فشل في تحديث المنشور");
    }
  };

  const fetchBlockReasons = async (
    item_as: "shop" | "used" | "job" | undefined
  ) => {
    setLoading(true);
    try {
      const response = await getReasons();
      setBlockReasons(item_as === "job" ? response.jobs : response.items);
    } catch (err) {
      toast.error("فشل في تحميل أسباب الحظر");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (
    newStatus: "active" | "blocked" | "pending",
    reason?: string
  ) => {
    if (!item) return;

    setUpdatingStatus(true);
    try {
      let description: string | null = null;

      if (newStatus === "blocked") {
        description = `${
          selectedReason === "آخر"
            ? customReason
            : selectedReason
        }`;
      } else if (newStatus === "pending" && reason) {
        description = reason;
      }

      await updateItem(item.uuid, {
        status_note: description,
        is_active: newStatus,
      });

      toast.success(
        `تم تحديث الحالة بنجاح إلى ${
          newStatus === "active" ? "نشط" : newStatus === "blocked" ? "محظور" : "معلق"
        }`
      );

      const updatedItem = await fetchItem(item.uuid);
      if (updatedItem) {
        onItemUpdate(updatedItem);
      }
    } catch (err) {
      toast.error("فشل في تحديث الحالة");
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
      fetchItem(uuid).then((res) => {
        fetchBlockReasons(res?.item_as);
      });
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
            <span className="sr-only">جاري التحميل...</span>
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
              إعادة المحاولة
            </Button>
          </div>
        ) : item ? (
          <div
            className="flex flex-col lg:flex-row-reverse"
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
              fetchItem={fetchItem}
              onItemUpdate={onItemUpdate}
            />
          </div>
        ) : null}
        {item && (
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
            fetchItem={fetchItem}
            onItemUpdate={onItemUpdate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
