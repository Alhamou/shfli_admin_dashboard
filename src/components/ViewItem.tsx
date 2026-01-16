import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ICreatMainItem } from "@/interfaces";
import { getItem, getReasons, updateItem } from "@/services/restApiServices";
import { Loader2, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ViewItemActions } from "./ViewItemActions";
import { ViewItemFooter } from "./ViewItemFooter";
import { ViewItemImages } from "./ViewItemImages";
import { ViewItemMiddleColumn } from "./ViewItemMiddleColumn";
import { Badge } from "./ui/badge";

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

  const handlePositionToggle = async () => {
    if (!item) return;
    const newPosition = item.position === 1 ? 0 : 1;
    try {
      await updateItem(item.uuid, { position: newPosition });
      const updatedItem = { ...item, position: newPosition };
      setItem(updatedItem);
      onItemUpdate(updatedItem);
      toast.success("تم تحديث حالة التمييز بنجاح");
    } catch (error) {
      toast.error("فشل تحديث حالة التمييز");
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "نشط";
      case "blocked": return "محظور";
      case "pending": return "معلق";
      default: return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "blocked": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] lg:max-w-[90vw] xl:max-w-[85vw] w-full max-h-[95vh] p-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {item?.title || "تفاصيل المنشور"}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  {item && (
                    <>
                      <Badge variant="outline" className="text-xs">
                        ID: {item.id}
                      </Badge>
                      <Badge className={`text-xs border-0 ${getStatusVariant(item.is_active)}`}>
                        {getStatusLabel(item.is_active)}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col justify-center items-center h-64">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <span className="text-muted-foreground">جاري التحميل...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                  <Package className="h-8 w-8 text-destructive" />
                </div>
                <p className="text-destructive font-medium mb-2">{error}</p>
                <Button
                  variant="outline"
                  onClick={() => fetchItem(uuid)}
                  className="mt-2"
                >
                  إعادة المحاولة
                </Button>
              </div>
            ) : item ? (
              <div className="flex flex-col lg:flex-row-reverse gap-6">
                {/* Images - Left on RTL */}
                <ViewItemImages item={item} />

                {/* Details - Center */}
                <ViewItemMiddleColumn
                  isEditing={isEditing}
                  item={item}
                  editedFields={editedFields}
                  originalItem={originalItem}
                  setEditedFields={setEditedFields}
                  setItem={setItem}
                  onPositionToggle={handlePositionToggle}
                />

                {/* Actions - Right on RTL */}
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
          </div>
        </div>

        {/* Footer - Fixed at bottom with scrollable content */}
        {item && (
          <div className="border-t bg-muted/30 px-6 py-4 flex-shrink-0 max-h-[45vh] overflow-y-auto">
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
