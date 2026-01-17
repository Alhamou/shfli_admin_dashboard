import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomBadge } from "@/components/ui/custom-badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { IUser } from "@/interfaces";
import { getUserInfo } from "@/services/restApiServices";
import {
    Briefcase,
    ExternalLink,
    Loader2,
    Mail,
    MapPin,
    Shield,
    Tag,
    User as UserIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

interface UserDetailDialogProps {
  userId: string | number;
  trigger?: React.ReactNode;
}

export const UserDetailDialog = ({ userId, trigger }: UserDetailDialogProps) => {
  const [userData, setUserData] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && userId) {
      handleFetchUser();
    }
  }, [open, userId]);

  const handleFetchUser = async () => {
    setLoading(true);
    try {
      const data = await getUserInfo(userId.toString());
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = () => {
    if (userData?.first_name || userData?.last_name) {
      return `${userData?.first_name?.charAt(0) || ""}${userData?.last_name?.charAt(0) || ""}`.toUpperCase();
    }
    return "م";
  };

  const formatDate = (date: Date | null | number | string) => {
    if (!date) return "غير متوفر";
    return new Date(date).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="link" className="p-0 h-auto font-black tabular-nums">
            {userId}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl sm:rounded-3xl border-none shadow-2xl bg-background" dir="rtl">
        <DialogHeader className="p-6 pb-0 flex items-center justify-between space-y-0">
          <DialogTitle className="text-xl font-black flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            تفاصيل المستخدم
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[85vh]" dir="rtl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-muted-foreground font-medium">جاري تحميل بيانات المستخدم...</p>
            </div>
          ) : userData ? (
            <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Header Profile Section - Avatar on Right, Text on Left in RTL */}
              <div className="flex items-start gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-xl rounded-3xl">
                    {userData.image && <AvatarImage src={userData.image} />}
                    <AvatarFallback className="bg-primary/10 text-primary text-3xl font-black">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-2 -left-2 h-8 w-8 rounded-xl border-4 border-background flex items-center justify-center shadow-lg ${userData.blocked ? "bg-destructive" : "bg-emerald-500"}`}>
                    {userData.blocked ? <Shield className="h-4 w-4 text-white" /> : <div className="h-2 w-2 rounded-full bg-white animate-pulse" />}
                  </div>
                </div>

                <div className="flex-1 space-y-2 text-right">
                  <h2 className="text-2xl font-black text-foreground">
                    {userData.first_name ?? ""} {userData.last_name ?? ""}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <CustomBadge variant={userData.account_type === "business" ? "shop" : "unknown"} className="px-2 py-0.5 text-xs font-bold">
                      {userData.account_type === "business" ? "حساب تجاري" : "حساب فردي"}
                    </CustomBadge>
                    {userData.account_verified && <CustomBadge variant="active" className="px-2 py-0.5 text-xs font-bold">موثق</CustomBadge>}
                    {userData.blocked && <CustomBadge variant="blocked" className="px-2 py-0.5 text-xs font-bold">محظور</CustomBadge>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium pt-1">
                    <span className="bg-muted px-2 py-0.5 rounded-md tabular-nums">ID: {userData.id}</span>
                    <span className="opacity-50">•</span>
                    <span>عضو منذ {formatDate(userData.created_at)}</span>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/40" />

              {/* Contact Info and Roles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-black flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                    <Mail className="h-4 w-4" /> معلومات التواصل
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/30 rounded-2xl border border-border/40 space-y-1 text-right">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ">البريد الإلكتروني</p>
                      <p className="text-sm font-bold truncate [direction:ltr] text-right">{userData.email || "غير متوفر"}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-2xl border border-border/40 space-y-1 text-right">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ">رقم الهاتف</p>
                      <p className="text-sm font-bold tabular-nums [direction:ltr] text-right">{userData.phone_number || "غير متوفر"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                    <Shield className="h-4 w-4" /> الأدوار والوظائف
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-start">
                    {userData.roles?.map((role) => (
                      <Badge key={role} variant="secondary" className="px-3 py-1 rounded-xl text-xs font-bold bg-primary/5 text-primary border-primary/10">
                        {role}
                      </Badge>
                    ))}
                    {(!userData.roles || userData.roles.length === 0) && (
                      <p className="text-xs text-muted-foreground font-medium italic text-right w-full">لم يتم تعيين أي أدوار.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Section if applicable */}
              {userData.account_type === "business" && (userData.business_account) && (
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-black flex items-center gap-2 text-primary uppercase tracking-wider">
                    <Briefcase className="h-4 w-4" /> معلومات النشاط التجاري
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 md:col-span-2 space-y-2 text-right">
                      <div className="flex justify-between items-start">
                        <div className="text-right flex-1">
                          <p className="text-lg font-black">{userData.business_account.business_name || "اسم النشاط غير متوفر"}</p>
                          <div className="flex items-center gap-2 text-xs font-bold text-primary/70 mt-1">
                            <Tag className="h-3 w-3" />
                            {userData.business_account.business_type?.ar || "نوع غير محدد"}
                          </div>
                        </div>
                        {userData.business_account.website_url && (
                          <a href={userData.business_account.website_url} target="_blank" rel="noopener noreferrer" className="h-8 w-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-primary hover:bg-primary hover:text-white transition-colors">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      {userData.business_account.business_description && (
                        <p className="text-xs text-muted-foreground leading-relaxed mt-2 text-right">{userData.business_account.business_description}</p>
                      )}
                    </div>

                    <div className="p-3 bg-muted/30 rounded-2xl border border-border/40 space-y-2 text-right">
                      <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                        <MapPin className="h-3.5 w-3.5" />
                        عنوان العمل
                      </div>
                      <p className="text-sm font-bold truncate">{userData.business_account.business_address || "غير متوفر"}</p>
                    </div>

                    <div className="p-3 bg-muted/30 rounded-2xl border border-border/40 space-y-2 text-right">
                      <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                        <Shield className="h-3.5 w-3.5" />
                        الرقم الضريبي
                      </div>
                      <p className="text-sm font-bold tabular-nums [direction:ltr]">{userData.business_account.tax_number || "غير متوفر"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex justify-end pt-4 gap-3">
                <Button variant="outline" className="rounded-2xl font-bold gap-2" onClick={() => window.open(`/users?id=${userData.id}`, '_blank')}>
                   عرض في إدارة الحسابات
                   <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-20 text-center text-muted-foreground">
              فشل تحميل بيانات المستخدم.
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
