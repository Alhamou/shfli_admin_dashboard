import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Loader2 } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { ICreatMainItem } from "@/interfaces";

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
}: {
  showReasonInput: boolean;
  selectedReason: string;
  blockReasons: string[];
  setSelectedReason: Dispatch<SetStateAction<string>>;
  setCustomReason: Dispatch<SetStateAction<string>>;
  customReason: string;
  item: ICreatMainItem | null;
  setShowReasonInput: Dispatch<SetStateAction<boolean>>;
  handleStatusToggle: (
    newStatus: "active" | "blocked" | "pending"
  ) => Promise<void>;
  updatingStatus: boolean;
  handleBlockAction: () => void;
}) => {
  const { t } = useTranslation();
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
      <div className="col-span-full border-t pt-4 mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium">{t("dialog.labels.status")}:</span>
          <Badge
            variant={
              item?.is_active === "active"
                ? "default"
                : item?.is_active === "blocked"
                ? "destructive"
                : "secondary"
            }
            className={`${
              item?.is_active === "pending" ? "bg-orange-500" : ""
            }`}
          >
            {item?.is_active}
          </Badge>
          <span className="text-sm">
            {item?.status_note ? item?.status_note : ""}
          </span>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => handleStatusToggle("pending")}
            variant="outline"
            disabled={updatingStatus || item?.is_active === "pending"}
            className="w-full sm:w-auto bg-orange-500"
          >
            {updatingStatus ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {t("dialog.buttons.markPending")}
          </Button>
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
