import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ICreatMainItem, NotificationAction, NotificationBody } from "@/interfaces";
import { adLink, displaySize, parseLinkTarget, shrinkImage } from "@/lib/notificationHelpers";
import { cn } from "@/lib/utils";
import { uploadNotificationImage } from "@/services/restApiServices";
import {
  BellRing,
  CheckCircle2,
  ExternalLink,
  ImagePlus,
  Inbox,
  Link2,
  Loader2,
  RefreshCw,
  Send,
  Smartphone,
  Trash2,
  TriangleAlert,
  User,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface SendNotificationPopupProps {
  /** true = every user (topic "all"), false = one user. */
  is_public: boolean;
  userId: number;
  /** Push + inbox entry. Should throw when sending failed (the dialog then stays open). */
  onSend: (body: NotificationBody) => Promise<unknown> | void;
  /** Every user, push only (no inbox entry). Offered only when given. */
  onSendPushOnly?: (body: { title: string; description: string; image_url?: string }) => Promise<unknown> | void;
  children: React.ReactNode;
  loading?: boolean;
  item?: ICreatMainItem | null;
}

type Picture = { url: string; width: number; height: number };

const DEFAULT_TITLE_PUBLIC = "مرحباً بكم في شفلي! 👋";
const DEFAULT_TITLE_USER = "لديك إشعار من إدارة المحتوى";

export const SendNotificationPopup = ({
  is_public,
  userId,
  onSend,
  onSendPushOnly,
  children,
  loading,
  item,
}: SendNotificationPopupProps) => {
  const [open, setOpen] = useState(false);
  const [inbox, setInbox] = useState(true);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState(item?.uuid ? adLink(item.uuid) : "");
  const [picture, setPicture] = useState<Picture | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const pushOnly = is_public && !!onSendPushOnly && !inbox;
  const target = parseLinkTarget(link);
  const defaultTitle = is_public ? DEFAULT_TITLE_PUBLIC : DEFAULT_TITLE_USER;
  const shownTitle = title.trim() || defaultTitle;
  const imageSrc = localPreview || picture?.url || null;
  const busy = sending || !!loading;
  const messageMissing = !message.trim();
  const linkBad = !pushOnly && target.kind === "invalid";

  // The confirm step ends by itself after a few seconds.
  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(false), 4000);
    return () => clearTimeout(t);
  }, [confirming]);

  const reset = () => {
    setInbox(true);
    setTitle("");
    setMessage("");
    setLink(item?.uuid ? adLink(item.uuid) : "");
    setPicture(null);
    setLocalPreview(null);
    setConfirming(false);
    setShowErrors(false);
  };

  const pickFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("اختر صورة");
      return;
    }
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    setPicture(null);
    setUploading(true);
    try {
      const { blob } = await shrinkImage(file);
      const res = await uploadNotificationImage(blob);
      setPicture({ url: res.image_url, width: res.width, height: res.height });
    } catch (e) {
      console.error(e);
      toast.error("لم يتم رفع الصورة، جرّب صورة أخرى");
      setLocalPreview(null);
    } finally {
      setUploading(false);
    }
  };

  // Paste a picture straight into the dialog.
  useEffect(() => {
    if (!open) return;
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files ?? []).find((f) => f.type.startsWith("image/"));
      if (file) {
        e.preventDefault();
        pickFile(file);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const buildAction = (): NotificationAction | undefined => {
    const action: NotificationAction = {};
    if (target.kind === "ad") {
      action.navigate_info = { tab: "Home", screen: "Details", params: { uuid: target.uuid } };
    } else if (target.kind === "link") {
      action.outside_link = target.url;
    }
    if (picture) action.image = { image_url: picture.url, ...displaySize(picture.width, picture.height) };
    return Object.keys(action).length ? action : undefined;
  };

  const handleSend = async () => {
    if (messageMissing || linkBad || uploading) {
      setShowErrors(true);
      return;
    }
    if (is_public && !confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    setSending(true);
    try {
      if (pushOnly) {
        await onSendPushOnly!({ title: shownTitle, description: message.trim(), ...(picture && { image_url: picture.url }) });
      } else {
        await onSend({
          message: message.trim(),
          ...(title.trim() && { title: title.trim() }),
          is_public,
          ...(!is_public && { user_id: userId }),
          ...(buildAction() && { action: buildAction() }),
        });
      }
      reset();
      setOpen(false);
    } catch {
      // The page already showed the error; keep what was typed.
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setConfirming(false);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent dir="rtl" className="sm:max-w-[880px] p-0 gap-0 overflow-hidden rounded-3xl max-h-[92vh] overflow-y-auto">
        <div className="grid md:grid-cols-[1fr_300px]">
          {/* Form */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 pl-12">
              <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <BellRing className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <DialogTitle className="text-xl font-black text-right">إشعار جديد</DialogTitle>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  {is_public ? <Users className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                  <span>{is_public ? "لكل المستخدمين" : `للمستخدم #${userId}`}</span>
                </div>
              </div>
            </div>

            {is_public && onSendPushOnly && (
              <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-muted/60">
                {[
                  { value: true, icon: Inbox, label: "تنبيه + صندوق الإشعارات" },
                  { value: false, icon: BellRing, label: "تنبيه فقط" },
                ].map((o) => (
                  <button
                    key={String(o.value)}
                    type="button"
                    onClick={() => setInbox(o.value)}
                    className={cn(
                      "h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
                      inbox === o.value ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <o.icon className="h-4 w-4" />
                    {o.label}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 40))}
                placeholder={defaultTitle}
                aria-label="العنوان"
                className="w-full bg-transparent text-lg font-bold placeholder:text-muted-foreground/50 outline-none border-b border-border/60 focus:border-primary pb-2 transition-colors"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب الرسالة…"
                aria-label="الرسالة"
                rows={3}
                className={cn(
                  "w-full resize-none rounded-2xl bg-muted/40 p-4 text-base leading-relaxed outline-none ring-1 ring-transparent focus:ring-primary/40 transition",
                  showErrors && messageMissing && "ring-orange-400/70 bg-orange-500/5"
                )}
              />
            </div>

            {/* Picture */}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                pickFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            {imageSrc ? (
              <div className="relative rounded-2xl overflow-hidden bg-muted/40">
                <img src={imageSrc} alt="" className="mx-auto max-h-52 object-contain" />
                {uploading && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                  </div>
                )}
                {!uploading && (
                  <div className="absolute top-2 left-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="h-9 w-9 rounded-xl bg-background/90 shadow flex items-center justify-center hover:bg-background"
                      aria-label="تغيير الصورة"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPicture(null);
                        setLocalPreview(null);
                      }}
                      className="h-9 w-9 rounded-xl bg-background/90 shadow flex items-center justify-center text-orange-600 hover:bg-background"
                      aria-label="حذف الصورة"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {picture && !uploading && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-emerald-600/90 text-white text-xs font-bold px-2 py-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span dir="ltr">{picture.width}×{picture.height}</span>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  pickFile(e.dataTransfer.files?.[0]);
                }}
                className={cn(
                  "w-full h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 text-muted-foreground transition-colors",
                  dragOver ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50 hover:text-foreground"
                )}
              >
                <ImagePlus className="h-7 w-7" />
                <span className="text-sm font-bold">أضف صورة</span>
                <span className="text-xs opacity-70">اختياري</span>
              </button>
            )}

            {/* What opens on tap */}
            {!pushOnly && (
              <div className="space-y-2">
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-2xl bg-muted/40 px-4 h-12 ring-1 ring-transparent focus-within:ring-primary/40 transition",
                    linkBad && showErrors && "ring-orange-400/70"
                  )}
                >
                  <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="رابط إعلان أو موقع (اختياري)"
                    dir={link ? "ltr" : "rtl"}
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
                  />
                </div>
                {target.kind !== "none" && (
                  <div
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-bold px-1",
                      target.kind === "invalid" ? "text-orange-600" : "text-emerald-600"
                    )}
                  >
                    {target.kind === "ad" && (
                      <>
                        <Smartphone className="h-3.5 w-3.5" /> يفتح الإعلان داخل التطبيق
                      </>
                    )}
                    {target.kind === "link" && (
                      <>
                        <ExternalLink className="h-3.5 w-3.5" /> يفتح الرابط
                      </>
                    )}
                    {target.kind === "invalid" && (
                      <>
                        <TriangleAlert className="h-3.5 w-3.5" /> الرابط غير صحيح
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleSend}
                disabled={busy || uploading}
                className={cn(
                  "h-12 flex-1 rounded-2xl text-base font-black gap-2 transition-colors",
                  confirming && "bg-orange-600 hover:bg-orange-700 text-white"
                )}
              >
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                {confirming ? "اضغط مرة ثانية للتأكيد" : is_public ? "إرسال للجميع" : "إرسال"}
              </Button>
              <Button variant="ghost" className="h-12 rounded-2xl px-5" onClick={() => setOpen(false)}>
                إلغاء
              </Button>
            </div>
          </div>

          {/* Live preview */}
          <div className="bg-muted/40 border-t md:border-t-0 md:border-r border-border/50 p-6 space-y-4">
            <div className="h-10 md:pl-12 text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5" /> هكذا يظهر
            </div>

            {/* Push banner */}
            <div className="rounded-2xl bg-background shadow-sm p-3 space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <img src="/shfli-logo.png" alt="" className="h-4 w-4 rounded" onError={(e) => (e.currentTarget.style.display = "none")} />
                <span className="font-bold">شفلي</span>
                <span>· الآن</span>
              </div>
              <div className="text-sm font-bold leading-snug line-clamp-1">{shownTitle}</div>
              <div className="text-xs text-muted-foreground leading-relaxed line-clamp-2 whitespace-pre-line">
                {message.trim() || "نص الرسالة"}
              </div>
              {imageSrc && <img src={imageSrc} alt="" className="w-full rounded-xl object-cover max-h-32" />}
            </div>

            {/* Inbox sheet */}
            {!pushOnly && (
              <div className="rounded-2xl bg-background shadow-sm p-3 space-y-3">
                <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                  <Inbox className="h-3.5 w-3.5" /> صندوق الإشعارات
                </div>
                {imageSrc && (
                  <img
                    src={imageSrc}
                    alt=""
                    className="w-full rounded-xl object-cover"
                    style={
                      picture
                        ? { aspectRatio: String(Math.min(2.5, Math.max(0.5, picture.width / picture.height))) }
                        : undefined
                    }
                  />
                )}
                <div className="text-sm leading-relaxed whitespace-pre-line">{message.trim() || "نص الرسالة"}</div>
                {(target.kind === "ad" || target.kind === "link") && (
                  <div className="h-9 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5">
                    شاهد المزيد
                    {target.kind === "link" ? <ExternalLink className="h-3.5 w-3.5" /> : null}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
