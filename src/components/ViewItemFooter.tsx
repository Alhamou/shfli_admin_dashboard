import { Bid_status, ICreatMainItem } from "@/interfaces";
import { updateItem } from "@/services/restApiServices";
import { Ban, Check, Clock, Loader2, X } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { CustomBadge } from "./ui/custom-badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

// Bid status form component
const BidStatusForm = ({
  onCancel,
  onSubmit,
  loading,
  item,
}: {
  onCancel: () => void;
  onSubmit: (status: Bid_status, note?: string) => void;
  loading: boolean;
  item: ICreatMainItem;
}) => {
  const [bidStatus, setBidStatus] = useState<Bid_status>(item.bid_status);
  const [statusNote, setStatusNote] = useState("");

  const handleSubmit = () => {
    if (bidStatus === "active") {
      onSubmit(bidStatus);
    } else {
      onSubmit(bidStatus, statusNote);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardContent className="p-4 space-y-4">
        <p className="font-semibold">تحديث حالة المزاد</p>
        <div className="space-y-3">
          <Select
            onValueChange={(val) => setBidStatus(val as Bid_status)}
            value={bidStatus || ""}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر حالة المزاد" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">نشط</SelectItem>
              <SelectItem value="ended">منتهي</SelectItem>
              <SelectItem value="ask_edit">طلب تعديل</SelectItem>
              <SelectItem value="blocked">محظور</SelectItem>
              <SelectItem value="pending">معلق</SelectItem>
            </SelectContent>
          </Select>

          {bidStatus && bidStatus !== "active" && (
            <Textarea
              placeholder="ملاحظة الحالة"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              className="min-h-[80px]"
            />
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel}>
            إلغاء
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!bidStatus || (bidStatus !== "active" && !statusNote) || loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
            تحديث
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Ban user form component
const BanUserForm = ({
  onCancel,
  onSubmit,
  loading,
}: {
  onCancel: () => void;
  onSubmit: (username: string) => void;
  loading: boolean;
}) => {
  const [username, setUsername] = useState("");

  return (
    <Card className="border-destructive/20">
      <CardContent className="p-4 space-y-4">
        <p className="font-semibold">حظر مستخدم من المزاد</p>
        <input
          type="text"
          placeholder="أدخل اسم المستخدم"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel}>
            إلغاء
          </Button>
          <Button
            size="sm"
            onClick={() => onSubmit(username)}
            disabled={!username || loading}
            variant="destructive"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
            حظر
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ViewItemFooter = ({
  showReasonInput,
  selectedReason,
  blockReasons,
  setSelectedReason,
  setCustomReason,
  customReason,
  item,
  setShowReasonInput,
  handleStatusToggle,
  updatingStatus,
  handleBlockAction,
  fetchItem,
  onItemUpdate,
}: {
  showReasonInput: boolean;
  selectedReason: string;
  blockReasons: string[];
  setSelectedReason: Dispatch<SetStateAction<string>>;
  setCustomReason: Dispatch<SetStateAction<string>>;
  customReason: string;
  item: ICreatMainItem;
  setShowReasonInput: Dispatch<SetStateAction<boolean>>;
  handleStatusToggle: (
    newStatus: "active" | "blocked" | "pending",
    reason?: string
  ) => Promise<void>;
  updatingStatus: boolean;
  handleBlockAction: () => void;
  fetchItem: (uuid: string) => Promise<ICreatMainItem | undefined>;
  onItemUpdate: (updatedItem: ICreatMainItem) => void;
}) => {
  const [showPendingInput, setShowPendingInput] = useState(false);
  const [showBidStatusForm, setShowBidStatusForm] = useState(false);
  const [showBanUserForm, setShowBanUserForm] = useState(false);
  const [banningUser, setBanningUser] = useState(false);
  const [pendingReason, setPendingReason] = useState(
    `بعد ان تقوم بتعديل هذا المنشور وحفظه، سيتم مراجعته من قبل فريقنا، وبمجعد الانتهاء من المراجعة، ستتلقى اشعارأ بشأن منشورك:\n\n`
  );

  const handlePendingAction = () => {
    if (item?.is_active !== "pending") {
      setShowPendingInput(true);
    }
  };

  const handlePendingSubmit = async () => {
    await handleStatusToggle("pending", pendingReason);
    setShowPendingInput(false);
    setPendingReason("");
  };

  const handleApprove = async () => {
    await handleStatusToggle("active");
  };

  const handleBidStatusUpdate = async (status: Bid_status, note?: string) => {
    try {
      await updateItem(item.uuid, {
        bid_status: status,
        status_note: note,
      });
      toast.success("تم تحديث حالة المزاد بنجاح");
      const updatedItem = await fetchItem(item.uuid);
      if (updatedItem) {
        onItemUpdate(updatedItem);
      }
      setShowBidStatusForm(false);
    } catch (error) {
      toast.error("فشل في تحديث حالة المزاد");
    }
  };

  const handleBanUser = async (username: string) => {
    setBanningUser(true);
    try {
      await updateItem(item.uuid, {
        user_selector: username,
      });
      toast.success("تم حظر المستخدم بنجاح");
      const updatedItem = await fetchItem(item.uuid);
      if (updatedItem) {
        onItemUpdate(updatedItem);
      }
      setShowBanUserForm(false);
    } catch (error) {
      toast.error("فشل في حظر المستخدم");
    } finally {
      setBanningUser(false);
    }
  };

  const getStatusBadge = (status: "active" | "pending" | "blocked") => {
    return (
      <CustomBadge variant={status} size="lg" className="whitespace-nowrap">
        {status === "active" ? "نشط" : status === "pending" ? "معلق" : "محظور"}
      </CustomBadge>
    );
  };

  const getBidStatusBadge = (status: string) => {
    const labels: Record<string, string> = {
      active: "نشط",
      ended: "منتهي",
      ask_edit: "طلب تعديل",
      blocked: "محظور",
      pending: "معلق",
    };
    return (
      <CustomBadge
        variant={status === "active" ? "active" : "pending"}
        size="lg"
        className="whitespace-nowrap"
      >
        {labels[status] || status}
      </CustomBadge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Block Reason Form */}
      {showReasonInput && (
        <Card className="border-destructive/20">
          <CardContent className="p-4 space-y-4" style={{ direction: "rtl" }}>
            <p className="font-semibold">اختر سبب الحظر</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start whitespace-normal text-right h-auto min-h-[40px] py-2"
                >
                  {selectedReason || "اختر سبب الحظر"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-80 overflow-y-auto">
                {blockReasons.map((reason) => (
                  <DropdownMenuItem
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    style={{ direction: "rtl" }}
                  >
                    {reason}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  onClick={() => setSelectedReason("آخر")}
                  style={{ direction: "rtl" }}
                >
                  آخر
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {selectedReason === "آخر" && (
              <Textarea
                placeholder="حدد السبب"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="min-h-[80px]"
              />
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowReasonInput(false);
                  setSelectedReason("");
                  setCustomReason("");
                }}
              >
                <X className="h-4 w-4 ml-1" />
                إلغاء
              </Button>
              <Button
                size="sm"
                onClick={() => handleStatusToggle("blocked")}
                disabled={
                  !selectedReason ||
                  (selectedReason === "آخر" && !customReason) ||
                  updatingStatus
                }
                variant="destructive"
              >
                {updatingStatus && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                تأكيد الحظر
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Reason Form */}
      {showPendingInput && (
        <Card className="border-amber-500/20">
          <CardContent className="p-4 space-y-4" style={{ direction: "rtl" }}>
            <p className="font-semibold">سبب التعليق</p>
            <Textarea
              placeholder="حدد سبب التعليق"
              value={pendingReason}
              onChange={(e) => setPendingReason(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPendingInput(false);
                  setPendingReason("");
                }}
              >
                <X className="h-4 w-4 ml-1" />
                إلغاء
              </Button>
              <Button
                size="sm"
                onClick={handlePendingSubmit}
                disabled={!pendingReason || updatingStatus}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {updatingStatus && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                تأكيد التعليق
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bid Status Form */}
      {showBidStatusForm && (
        <BidStatusForm
          onCancel={() => setShowBidStatusForm(false)}
          onSubmit={handleBidStatusUpdate}
          loading={updatingStatus}
          item={item}
        />
      )}

      {/* Ban User Form */}
      {showBanUserForm && (
        <BanUserForm
          onCancel={() => setShowBanUserForm(false)}
          onSubmit={handleBanUser}
          loading={banningUser}
        />
      )}

      {/* Main Footer Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Status Display */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">الحالة:</span>
            {getStatusBadge(item?.is_active ?? "active")}
          </div>
          {item?.item_for === "bid" && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">المزاد:</span>
              {getBidStatusBadge(item?.bid_status ?? "active")}
            </div>
          )}
          {item?.status_note && (
            <span className="text-sm text-muted-foreground truncate max-w-[200px]">
              ({item.status_note})
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          {/* Bid-specific buttons */}
          {item?.item_for === "bid" && (
            <>
              <Button
                onClick={() => setShowBidStatusForm(true)}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none hover:bg-primary/10 hover:text-primary hover:border-primary/30"
              >
                <Clock className="h-4 w-4 ml-1" />
                تحديث حالة المزاد
              </Button>
              <Button
                onClick={() => setShowBanUserForm(true)}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              >
                <Ban className="h-4 w-4 ml-1" />
                حظر مستخدم من المزاد
              </Button>
            </>
          )}

          {/* Common status buttons for all items */}
          {item?.item_for !== "bid" && (
            <>
              {item?.is_active === "pending" ? (
                <Button
                  onClick={handleApprove}
                  disabled={updatingStatus}
                  size="sm"
                  className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  {updatingStatus ? (
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  ) : (
                    <Check className="h-4 w-4 ml-1" />
                  )}
                  موافقة
                </Button>
              ) : (
                <Button
                  onClick={handlePendingAction}
                  variant="outline"
                  disabled={updatingStatus}
                  size="sm"
                  className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white border-amber-500"
                >
                  <Clock className="h-4 w-4 ml-1" />
                  تحديد كمعلق
                </Button>
              )}
              <Button
                onClick={handleBlockAction}
                variant={item?.is_active === "active" ? "destructive" : "default"}
                disabled={updatingStatus}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                {updatingStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                ) : item?.is_active === "active" ? (
                  <Ban className="h-4 w-4 ml-1" />
                ) : (
                  <Check className="h-4 w-4 ml-1" />
                )}
                {item?.is_active === "active" ? "حظر" : "إلغاء الحظر"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
