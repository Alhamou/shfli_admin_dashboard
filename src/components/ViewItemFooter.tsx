import { Bid_status, ICreatMainItem } from "@/interfaces";
import { updateItem } from "@/services/restApiServices";
import { Loader2 } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
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

// Add this new component for bid status form
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
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <p className="font-medium">تحديث حالة المزاد</p>

      <div className="space-y-2">
        <Select
          onValueChange={(val) => {
            setBidStatus(val as Bid_status);
          }}
          value={bidStatus || ""}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="اختر حالة المزاد" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">
              نشط
            </SelectItem>
            <SelectItem value="ended">
              منتهي
            </SelectItem>
            <SelectItem value="ask_edit">
              طلب تعديل
            </SelectItem>
            <SelectItem value="blocked">
              محظور
            </SelectItem>
            <SelectItem value="pending">
              معلق
            </SelectItem>
          </SelectContent>
        </Select>

        {bidStatus && bidStatus !== "active" && (
          <Textarea
            placeholder="ملاحظة الحالة"
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            // required={bidStatus !== "active"}
          />
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            !bidStatus || (bidStatus !== "active" && !statusNote) || loading
          }
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          تحديث
        </Button>
      </div>
    </div>
  );
};

// Add this new component for ban user form
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

  const handleSubmit = () => {
    onSubmit(username);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <p className="font-medium">حظر مستخدم من المزاد</p>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="أدخل اسم المستخدم"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button onClick={handleSubmit} disabled={!username || loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          إرسال
        </Button>
      </div>
    </div>
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
  const [pendingReason, setPendingReason] =
    useState(`بعد ان تقوم بتعديل هذا المنشور وحفظه، سيتم مراجعته من قبل فريقنا، وبمجعد الانتهاء من المراجعة، ستتلقى اشعارأ بشأن منشورك:

    `);

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

  const handleBidStatusUpdate = async (
    status: Bid_status,
    note?: string
  ) => {
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
    return (
      <CustomBadge
        variant={status === "active" ? "active" : "pending"}
        size="lg"
        className="whitespace-nowrap"
      >
        {status === "active" ? "نشط" : status === "ended" ? "منتهي" : status === "ask_edit" ? "طلب تعديل" : status === "blocked" ? "محظور" : "معلق"}
      </CustomBadge>
    );
  };

  return (
    <>
      {showReasonInput && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <p className="font-medium">اختر سبب الحظر</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start whitespace-normal text-left h-auto min-h-[40px] py-2"
              >
                {selectedReason || "اختر سبب الحظر"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-80 overflow-y-scroll">
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
                onClick={() =>
                  setSelectedReason("آخر")
                }
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
            />
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowReasonInput(false);
                setSelectedReason("");
                setCustomReason("");
              }}
            >
              إلغاء
            </Button>
            <Button
              onClick={() => handleStatusToggle("blocked")}
              disabled={
                !selectedReason ||
                (selectedReason === "آخر" &&
                  !customReason) ||
                updatingStatus
              }
            >
              تأكيد
            </Button>
          </div>
        </div>
      )}

      {showPendingInput && (
        <div
          className="space-y-4 p-4 border rounded-lg bg-muted/50"
          style={{ direction: "rtl" }}
        >
          <p className="font-medium">سبب التعليق</p>
          <Textarea
            placeholder="حدد سبب التعليق"
            value={pendingReason}
            onChange={(e) => setPendingReason(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowPendingInput(false);
                setPendingReason("");
              }}
            >
              إلغاء
            </Button>
            <Button
              onClick={handlePendingSubmit}
              disabled={!pendingReason || updatingStatus}
            >
              تأكيد
            </Button>
          </div>
        </div>
      )}

      {showBidStatusForm && (
        <BidStatusForm
          onCancel={() => setShowBidStatusForm(false)}
          onSubmit={handleBidStatusUpdate}
          loading={updatingStatus}
          item={item}
        />
      )}

      {showBanUserForm && (
        <BanUserForm
          onCancel={() => setShowBanUserForm(false)}
          onSubmit={handleBanUser}
          loading={banningUser}
        />
      )}

      <div className="col-span-full border-t pt-4 mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium">الحالة:</span>
          {getStatusBadge(item?.is_active ?? "active")}
          {item?.item_for === "bid" && (
            <>
              <span className="font-medium">
                حالة المزاد:
              </span>
              {getBidStatusBadge(item?.bid_status ?? "active")}
            </>
          )}
          <span className="text-sm">
            {item?.status_note ? item?.status_note : ""}
          </span>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {item?.item_for === "bid" && (
            <>
              <Button
                onClick={() => setShowBidStatusForm(true)}
                variant="outline"
                className="w-full sm:w-auto"
              >
                تحديث حالة المزاد
              </Button>
              <Button
                onClick={() => setShowBanUserForm(true)}
                variant="outline"
                className="w-full sm:w-auto"
              >
                حظر مستخدم من المزاد
              </Button>
            </>
          )}
          {item.item_for !== "bid" && (
            <>
              {item?.is_active === "pending" ? (
                <Button
                  onClick={handleApprove}
                  variant="default"
                  disabled={updatingStatus}
                  className="w-full sm:w-auto bg-green-500 hover:bg-green-600"
                >
                  {updatingStatus ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  موافقة
                </Button>
              ) : (
                <Button
                  onClick={handlePendingAction}
                  variant="outline"
                  disabled={updatingStatus}
                  className={`w-full sm:w-auto bg-orange-500 hover:bg-orange-500`}
                >
                  تحديد كمعلق
                </Button>
              )}
              <Button
                onClick={handleBlockAction}
                variant={
                  item?.is_active === "active" ? "destructive" : "default"
                }
                disabled={updatingStatus}
                className="w-full sm:w-auto"
              >
                {updatingStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {item?.is_active === "active"
                  ? "حظر"
                  : "إلغاء الحظر"}
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};
