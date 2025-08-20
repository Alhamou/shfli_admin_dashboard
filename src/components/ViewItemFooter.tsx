import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Textarea } from "./ui/textarea";
import { Loader2 } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { Bid_status, ICreatMainItem } from "@/interfaces";
import { CustomBadge } from "./ui/custom-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { updateItem } from "@/services/restApiServices";

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
  const { t } = useTranslation();
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
      <p className="font-medium">{t("dialog.labels.updateBidStatus")}</p>

      <div className="space-y-2">
        <Select
          onValueChange={(val) => {
            setBidStatus(val as Bid_status);
          }}
          value={bidStatus}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("dialog.labels.selectBidStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">
              {t("dashboard.statusTypes.active")}
            </SelectItem>
            <SelectItem value="ended">
              {t("dashboard.statusTypes.ended")}
            </SelectItem>
            <SelectItem value="ask_edit">
              {t("dashboard.statusTypes.askEdit")}
            </SelectItem>
            <SelectItem value="blocked">
              {t("dashboard.statusTypes.blocked")}
            </SelectItem>
            <SelectItem value="pending">
              {t("dashboard.statusTypes.pending")}
            </SelectItem>
          </SelectContent>
        </Select>

        {bidStatus && bidStatus !== "active" && (
          <Textarea
            placeholder={t("dialog.labels.statusNote")}
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            // required={bidStatus !== "active"}
          />
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          {t("dialog.buttons.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            !bidStatus || (bidStatus !== "active" && !statusNote) || loading
          }
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {t("dialog.buttons.update")}
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
  const { t } = useTranslation();
  const [username, setUsername] = useState("");

  const handleSubmit = () => {
    onSubmit(username);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <p className="font-medium">{t("dialog.labels.banUserFromBid")}</p>

      <div className="space-y-2">
        <input
          type="text"
          placeholder={t("dialog.labels.enterUsername")}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          {t("dialog.buttons.cancel")}
        </Button>
        <Button onClick={handleSubmit} disabled={!username || loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {t("dialog.buttons.submit")}
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
  const { t, i18n } = useTranslation();
  const [showPendingInput, setShowPendingInput] = useState(false);
  const [showBidStatusForm, setShowBidStatusForm] = useState(false);
  const [showBanUserForm, setShowBanUserForm] = useState(false);
  const [banningUser, setBanningUser] = useState(false);
  const [pendingReason, setPendingReason] =
    useState(`بعد ان تقوم بتعديل هذا المنشور وحفظه، سيتم مراجعته من قبل فريقنا، وبمجعد الانتهاء من المراجعة، ستتلقى اشعارأ بشأن منشورك:
    
    `);
  const [convertingToSale, setConvertingToSale] = useState(false);

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
    status: "active" | "ended" | "pending" | "ask_edit" | "blocked",
    note?: string
  ) => {
    try {
      await updateItem(item.uuid, {
        bid_status: status,
        status_note: note,
      });
      toast.success(t("messages.bidStatusUpdateSuccess"));
      const updatedItem = await fetchItem(item.uuid);
      if (updatedItem) {
        onItemUpdate(updatedItem);
      }
    } catch (error) {
      toast.error(t("messages.bidStatusUpdateError"));
    }
  };

  const handleConvertToSale = async () => {
    setConvertingToSale(true);
    try {
      await updateItem(item.uuid, {
        is_active: "active",
        item_for: "sale",
        status_note: null,
        bid_end_time: null,
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

  const handleBanUser = async (username: string) => {
    setBanningUser(true);
    try {
      await updateItem(item.uuid, {
        user_selector: username,
      });
      toast.success(t("messages.banUserSuccess"));
      const updatedItem = await fetchItem(item.uuid);
      if (updatedItem) {
        onItemUpdate(updatedItem);
      }
      setShowBanUserForm(false);
    } catch (error) {
      toast.error(t("messages.banUserError"));
    } finally {
      setBanningUser(false);
    }
  };

  const getStatusBadge = (status: "active" | "pending" | "blocked") => {
    return (
      <CustomBadge variant={status} size="lg" className="whitespace-nowrap">
        {t(`dashboard.statusTypes.${status}`)}
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
        {t(`dashboard.statusTypes.${status}`)}
      </CustomBadge>
    );
  };

  return (
    <>
      {showReasonInput && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <p className="font-medium">{t("dialog.labels.selectReason")}</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start whitespace-normal text-left h-auto min-h-[40px] py-2"
              >
                {selectedReason || t("dialog.labels.selectReason")}
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
                  setSelectedReason(t("dialog.messages.blockReason.other"))
                }
                style={{ direction: "rtl" }}
              >
                {t("dialog.messages.blockReason.other")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedReason === t("dialog.messages.blockReason.other") && (
            <Textarea
              placeholder={t("dialog.labels.specifyReason")}
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
              {t("dialog.buttons.cancel")}
            </Button>
            <Button
              onClick={() => handleStatusToggle("blocked")}
              disabled={
                !selectedReason ||
                (selectedReason === t("dialog.messages.blockReason.other") &&
                  !customReason) ||
                updatingStatus
              }
            >
              {t("dialog.buttons.confirm")}
            </Button>
          </div>
        </div>
      )}

      {showPendingInput && (
        <div
          className="space-y-4 p-4 border rounded-lg bg-muted/50"
          style={{ direction: i18n.language === "ar" ? "rtl" : "ltr" }}
        >
          <p className="font-medium">{t("dialog.labels.pendingReason")}</p>
          <Textarea
            placeholder={t("dialog.labels.specifyPendingReason")}
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
              {t("dialog.buttons.cancel")}
            </Button>
            <Button
              onClick={handlePendingSubmit}
              disabled={!pendingReason || updatingStatus}
            >
              {t("dialog.buttons.confirm")}
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
          <span className="font-medium">{t("dialog.labels.status")}:</span>
          {getStatusBadge(item?.is_active ?? "active")}
          {item?.item_for === "bid" && (
            <>
              <span className="font-medium">
                {t("dialog.labels.bidStatus")}:
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
                {t("dialog.buttons.updateBidStatus")}
              </Button>
              <Button
                onClick={() => setShowBanUserForm(true)}
                variant="outline"
                className="w-full sm:w-auto"
              >
                {t("dialog.buttons.banUserFromBid")}
              </Button>
              <Button
                onClick={handleConvertToSale}
                variant="outline"
                disabled={convertingToSale || updatingStatus}
                className="w-full sm:w-auto"
              >
                {convertingToSale ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {t("dialog.buttons.convertToSale")}
              </Button>
            </>
          )}
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
              {t("dialog.buttons.approve")}
            </Button>
          ) : (
            <Button
              onClick={handlePendingAction}
              variant="outline"
              disabled={updatingStatus}
              className={`w-full sm:w-auto bg-orange-500 hover:bg-orange-500`}
            >
              {t("dialog.buttons.markPending")}
            </Button>
          )}
          <Button
            onClick={handleBlockAction}
            variant={item?.is_active === "active" ? "destructive" : "default"}
            disabled={updatingStatus}
            className="w-full sm:w-auto"
          >
            {updatingStatus ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {item?.is_active === "active"
              ? t("dialog.buttons.block")
              : t("dialog.buttons.unblock")}
          </Button>
        </div>
      </div>
    </>
  );
};
