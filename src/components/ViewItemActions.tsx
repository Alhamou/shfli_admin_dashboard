import { ICreatMainItem } from "@/interfaces";
import { sendNotTeam, updateItem } from "@/services/restApiServices";
import { Edit, ExternalLink, Flag, Loader2, MessageCircle, RefreshCw, Save, Share2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SendNotificationPopup } from "./SendNotificationPopup";
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
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";

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
      toast.success("تم التحويل إلى منشور عادي بنجاح");
      const updatedItem = await fetchItem(item.uuid);
      if (updatedItem) {
        onItemUpdate(updatedItem);
      }
    } catch (error) {
      toast.error("فشل في التحويل إلى منشور عادي");
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
      <Card className="lg:w-48 xl:w-56 flex-shrink-0 h-fit sticky top-4">
        <CardContent className="p-4 space-y-3">
          {/* Edit Actions */}
          {isEditing ? (
            <div className="space-y-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                disabled={Object.keys(editedFields).length === 0}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Save className="h-4 w-4 ml-2" />
                حفظ التعديلات
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditToggle}
                className="w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              >
                <X className="h-4 w-4 ml-2" />
                إلغاء
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditToggle}
              className="w-full hover:bg-primary/10 hover:text-primary hover:border-primary/30"
            >
              <Edit className="h-4 w-4 ml-2" />
              تعديل المنشور
            </Button>
          )}

          <Separator />

          {/* Communication */}
          <SendNotificationPopup
            is_public={false}
            userId={item.user_id}
            loading={loading}
            item={item}
            onSend={async (messageData) => {
              setIsloading(true);
              try {
                await sendNotTeam(messageData);
                toast.success("تم إرسال الإشعار بنجاح");
              } catch {
                toast.error("فشل في إرسال الإشعار");
              } finally {
                setIsloading(false);
              }
            }}
          >
            <Button variant="outline" size="sm" className="w-full">
              <MessageCircle className="h-4 w-4 ml-2" />
              مراسلة المستخدم
            </Button>
          </SendNotificationPopup>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Share2 className="h-3.5 w-3.5 ml-1" />
              مشاركة
            </Button>
            <Button variant="outline" size="sm" className="text-xs" disabled={updatingStatus}>
              <Flag className="h-3.5 w-3.5 ml-1" />
              إبلاغ
            </Button>
          </div>

          {/* View in App */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:bg-primary hover:text-white transition-all"
            onClick={() => window.open(`https://www.shfli.com/items/details?uuid=${item.uuid}`, '_blank')}
          >
            <ExternalLink className="h-4 w-4 ml-2" />
            عرض في التطبيق
          </Button>

          {/* Bid Conversion */}
          {item?.item_for === "bid" && (
            <>
              <Separator />
              <Button
                onClick={openConfirmDialog}
                variant="secondary"
                size="sm"
                disabled={convertingToSale || updatingStatus}
                className="w-full"
              >
                {convertingToSale ? (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 ml-2" />
                )}
                تحويل إلى منشور عادي
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد التحويل إلى منشور عادي</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في تحويل هذا المزاد إلى منشور عادي؟ سيتم حذف جميع المزايدات الحالية.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeConfirmDialog}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleConvertToSale}>تأكيد</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
