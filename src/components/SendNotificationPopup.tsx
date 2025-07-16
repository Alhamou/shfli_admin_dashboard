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
import { Switch } from "@/components/ui/switch";
import { ICreatMainItem } from "@/interfaces";

interface MessagePopupProps {
  is_public: boolean;
  userId: number;
  onSend: (messageData: any) => void;
  children: React.ReactNode;
  loading: boolean;
  item?: ICreatMainItem | null;
}

export const SendNotificationPopup = ({
  is_public,
  userId,
  onSend,
  children,
  loading,
  item,
}: MessagePopupProps) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [actionType, setActionType] = useState<"navigate" | "link" | "none">(
    "none"
  );
  const [navigateInfo, setNavigateInfo] = useState(
    item
      ? { tab: "Home", screen: "Details", uuid: item.uuid }
      : {
          tab: "",
          screen: "",
          uuid: "",
        }
  );
  const [outsideLink, setOutsideLink] = useState("");
  const [withImage, setWithImage] = useState(false);
  const [imageInfo, setImageInfo] = useState({
    image_url: "",
    width: "",
    height: "",
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!message.trim()) {
      newErrors.message = t("notificationPopup.errors.messageRequired");
    }

    if (actionType !== "none") {
      if (actionType === "navigate") {
        if (!navigateInfo.tab.trim()) {
          newErrors.tab = t("notificationPopup.errors.tabRequired");
        }
        if (!navigateInfo.screen.trim()) {
          newErrors.screen = t("notificationPopup.errors.screenRequired");
        }
        if (!navigateInfo.uuid.trim()) {
          newErrors.uuid = t("notificationPopup.errors.uuidRequired");
        }
      } else if (actionType === "link" && !outsideLink.trim()) {
        newErrors.link = t("notificationPopup.errors.linkRequired");
      }
    }

    if (withImage) {
      if (!imageInfo.image_url.trim()) {
        newErrors.image_url = t("notificationPopup.errors.imageUrlRequired");
      }
      if (!imageInfo.width) {
        newErrors.width = t("notificationPopup.errors.widthRequired");
      }
      if (!imageInfo.height) {
        newErrors.height = t("notificationPopup.errors.heightRequired");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const messageData: any = {
      message,
      is_public,
      ...(!is_public && { user_id: userId }),
    };

    if (actionType !== "none") {
      messageData.action =
        actionType === "navigate"
          ? {
              navigate_info: {
                tab: navigateInfo.tab,
                screen: navigateInfo.screen,
                params: { uuid: navigateInfo.uuid },
              },
            }
          : {
              outside_link: outsideLink,
            };
    }

    if (withImage) {
      if (!messageData.action) messageData.action = {};
      messageData.action.image = {
        image_url: imageInfo.image_url,
        width: parseInt(imageInfo.width),
        height: parseInt(imageInfo.height),
      };
    }

    onSend(messageData);
    resetForm();
  };

  const resetForm = () => {
    setMessage("");
    setActionType("none");
    setNavigateInfo({ tab: "", screen: "", uuid: "" });
    setOutsideLink("");
    setWithImage(false);
    setImageInfo({ image_url: "", width: "", height: "" });
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="sm:max-w-[500px]"
        style={{ direction: i18n.language === "ar" ? "rtl" : "ltr" }}
      >
        <DialogHeader>
          <DialogTitle>{t("notificationPopup.title")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">
              {t("notificationPopup.messageLabel")}*
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("notificationPopup.messagePlaceholder")}
              className={errors.message ? "border-red-500" : ""}
            />
            {errors.message && (
              <p className="text-sm text-red-500">{errors.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("notificationPopup.actionTypeLabel")}</Label>
            <RadioGroup
              value={actionType}
              onValueChange={(value) =>
                setActionType(value as "navigate" | "link" | "none")
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none">
                  {t("notificationPopup.messageOnlyOption")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="navigate" id="navigate" />
                <Label htmlFor="navigate">
                  {t("notificationPopup.navigationOption")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="link" id="link" />
                <Label htmlFor="link">
                  {t("notificationPopup.externalLinkOption")}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {actionType === "navigate" && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="tab">
                    {t("notificationPopup.tabLabel")}*
                  </Label>
                  <Input
                    id="tab"
                    value={navigateInfo.tab}
                    onChange={(e) =>
                      setNavigateInfo({ ...navigateInfo, tab: e.target.value })
                    }
                    style={{ direction: "ltr" }}
                    placeholder={t("notificationPopup.tabPlaceholder")}
                    className={errors.tab ? "border-red-500" : ""}
                  />
                  {errors.tab && (
                    <p className="text-sm text-red-500">{errors.tab}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="screen">
                    {t("notificationPopup.screenLabel")}*
                  </Label>
                  <Input
                    id="screen"
                    style={{ direction: "ltr" }}
                    value={navigateInfo.screen}
                    onChange={(e) =>
                      setNavigateInfo({
                        ...navigateInfo,
                        screen: e.target.value,
                      })
                    }
                    placeholder={t("notificationPopup.screenPlaceholder")}
                    className={errors.screen ? "border-red-500" : ""}
                  />
                  {errors.screen && (
                    <p className="text-sm text-red-500">{errors.screen}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="uuid">
                    {t("notificationPopup.uuidLabel")}*
                  </Label>
                  <Input
                    id="uuid"
                    style={{ direction: "ltr" }}
                    value={navigateInfo.uuid}
                    onChange={(e) =>
                      setNavigateInfo({ ...navigateInfo, uuid: e.target.value })
                    }
                    placeholder={t("notificationPopup.uuidPlaceholder")}
                    className={errors.uuid ? "border-red-500" : ""}
                  />
                  {errors.uuid && (
                    <p className="text-sm text-red-500">{errors.uuid}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {actionType === "link" && (
            <div className="space-y-1">
              <Label htmlFor="link">{t("notificationPopup.linkLabel")}*</Label>
              <Input
                id="link"
                value={outsideLink}
                onChange={(e) => setOutsideLink(e.target.value)}
                placeholder={t("notificationPopup.linkPlaceholder")}
                className={errors.link ? "border-red-500" : ""}
                style={{ direction: "ltr" }}
              />
              {errors.link && (
                <p className="text-sm text-red-500">{errors.link}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="with-image"
                checked={withImage}
                onCheckedChange={setWithImage}
                style={{ direction: "ltr" }}
              />
              <Label htmlFor="with-image">
                {t("notificationPopup.withImage")}
              </Label>
            </div>

            {withImage && (
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <Label htmlFor="image_url">
                    {t("notificationPopup.imageUrlLabel")}*
                  </Label>
                  <Input
                    id="image_url"
                    value={imageInfo.image_url}
                    onChange={(e) =>
                      setImageInfo({ ...imageInfo, image_url: e.target.value })
                    }
                    placeholder={t("notificationPopup.imageUrlPlaceholder")}
                    className={errors.image_url ? "border-red-500" : ""}
                    style={{ direction: "ltr" }}
                  />
                  {errors.image_url && (
                    <p className="text-sm text-red-500">{errors.image_url}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="width">
                      {t("notificationPopup.widthLabel")}*
                    </Label>
                    <Input
                      id="width"
                      type="number"
                      value={imageInfo.width}
                      onChange={(e) =>
                        setImageInfo({ ...imageInfo, width: e.target.value })
                      }
                      placeholder={t("notificationPopup.widthPlaceholder")}
                      className={errors.width ? "border-red-500" : ""}
                    />
                    {errors.width && (
                      <p className="text-sm text-red-500">{errors.width}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="height">
                      {t("notificationPopup.heightLabel")}*
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      value={imageInfo.height}
                      onChange={(e) =>
                        setImageInfo({ ...imageInfo, height: e.target.value })
                      }
                      placeholder={t("notificationPopup.heightPlaceholder")}
                      className={errors.height ? "border-red-500" : ""}
                    />
                    {errors.height && (
                      <p className="text-sm text-red-500">{errors.height}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

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
