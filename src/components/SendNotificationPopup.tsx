import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

interface MessagePopupProps {
  is_public: boolean;
  userId: number;
  onSend: (messageData: any) => void;
  children: React.ReactNode;
  loading : boolean
}

export const SendNotificationPopup = ({ is_public, userId, onSend, children,loading }: MessagePopupProps) => {
  const { t ,i18n} = useTranslation();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [actionType, setActionType] = useState<"navigate" | "link">("navigate");
  const [navigateInfo, setNavigateInfo] = useState({
    tab: "",
    screen: "",
    uuid: ""
  });
  const [outsideLink, setOutsideLink] = useState("");

  const handleSubmit = () => {
    const messageData = {
      message,
      action: actionType === "navigate" ? {
        navigate_info: {
          tab: navigateInfo.tab,
          screen: navigateInfo.screen,
          params: { uuid: navigateInfo.uuid }
        }
      } : {
        outside_link: outsideLink
      },
      user_id: userId
    };

    onSend(messageData);
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setMessage("");
    setActionType("navigate");
    setNavigateInfo({ tab: "", screen: "", uuid: "" });
    setOutsideLink("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" style={{direction : i18n.language === 'ar' ? 'rtl' : 'ltr'}}>
        <DialogHeader>
          <DialogTitle>{t("notificationPopup.title")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">{t("notificationPopup.messageLabel")}</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("notificationPopup.messagePlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("notificationPopup.actionTypeLabel")}</Label>
            <RadioGroup
              value={actionType}
              onValueChange={(value) => setActionType(value as "navigate" | "link")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="navigate" id="navigate" />
                <Label htmlFor="navigate">{t("notificationPopup.navigationOption")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="link" id="link" />
                <Label htmlFor="link">{t("notificationPopup.externalLinkOption")}</Label>
              </div>
            </RadioGroup>
          </div>

          {actionType === "navigate" ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="tab">{t("notificationPopup.tabLabel")}</Label>
                  <Input
                    id="tab"
                    value={navigateInfo.tab}
                    onChange={(e) => setNavigateInfo({...navigateInfo, tab: e.target.value})}
                    placeholder={t("notificationPopup.tabPlaceholder")}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="screen">{t("notificationPopup.screenLabel")}</Label>
                  <Input
                    id="screen"
                    value={navigateInfo.screen}
                    onChange={(e) => setNavigateInfo({...navigateInfo, screen: e.target.value})}
                    placeholder={t("notificationPopup.screenPlaceholder")}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="uuid">{t("notificationPopup.uuidLabel")}</Label>
                  <Input
                    id="uuid"
                    value={navigateInfo.uuid}
                    onChange={(e) => setNavigateInfo({...navigateInfo, uuid: e.target.value})}
                    placeholder={t("notificationPopup.uuidPlaceholder")}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <Label htmlFor="link">{t("notificationPopup.linkLabel")}</Label>
              <Input
                id="link"
                value={outsideLink}
                onChange={(e) => setOutsideLink(e.target.value)}
                placeholder={t("notificationPopup.linkPlaceholder")}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("notificationPopup.cancelButton")}
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {t("notificationPopup.sendButton")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};