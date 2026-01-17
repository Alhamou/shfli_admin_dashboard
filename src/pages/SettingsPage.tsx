import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomBadge } from "@/components/ui/custom-badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/context/AuthContext"
import { Bell, Globe, Lock, Mail, Phone, Settings, ShieldCheck, User } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth();

  const getInitials = () => {
    if (!user) return "AD";
    const first = user.first_name?.charAt(0) || "";
    const last = user.last_name?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <CustomBadge key={role} variant="active" className="bg-red-500/10 text-red-600 border-none">مسؤول نظام</CustomBadge>;
      case "team":
        return <CustomBadge key={role} variant="active" className="bg-blue-500/10 text-blue-600 border-none">فريق العمل</CustomBadge>;
      case "user":
        return <CustomBadge key={role} variant="active" className="bg-emerald-500/10 text-emerald-600 border-none">مستخدم</CustomBadge>;
      default:
        return <CustomBadge key={role} variant="unknown">{role}</CustomBadge>;
    }
  };

  const InfoItem = ({ icon, label, value, isLtr }: { icon: React.ReactNode, label: string, value: string | number, isLtr?: boolean }) => (
    <div className="space-y-2 group">
        <div className="flex items-center gap-2 px-1">
            <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {icon}
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
        </div>
        <div className={`p-4 bg-background/50 border border-transparent group-hover:border-primary/20 group-hover:bg-background rounded-2xl transition-all shadow-sm ${isLtr ? 'text-left font-mono' : 'font-bold'}`} dir={isLtr ? 'ltr' : 'rtl'}>
            <p className="text-sm truncate">{value}</p>
        </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500" style={{ direction: "rtl" }}>
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
           <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <Settings className="h-5 w-5" />
           </div>
           <h1 className="text-2xl font-black tracking-tight text-foreground">الإعدادات والتفضيلات</h1>
        </div>
        <p className="text-muted-foreground font-medium mr-13">إدارة إعدادات النظام وتخصيص تجربة المستخدم</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Admin Information Card */}
          <Card className="border-border/40 shadow-xl shadow-black/5 bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2.5rem]">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-4 mb-2">
                 <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <ShieldCheck className="h-6 w-6" />
                 </div>
                 <div>
                    <CardTitle className="text-xl font-black">بيانات المشرف الحالي</CardTitle>
                    <CardDescription className="font-bold text-muted-foreground/70">تفاصيل الحساب المسجل به الأن في النظام</CardDescription>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <InfoItem icon={<User className="h-4 w-4" />} label="الاسم الكامل" value={`${user?.first_name || ""} ${user?.last_name || ""}`} />
                <InfoItem icon={<Mail className="h-4 w-4" />} label="البريد الإلكتروني" value={user?.email || "غير متوفر"} isLtr />
                <InfoItem icon={<Phone className="h-4 w-4" />} label="رقم الهاتف" value={user?.phone_number || "غير متوفر"} isLtr />
                <InfoItem icon={<Globe className="h-4 w-4" />} label="نوع الحساب" value={user?.account_type === "business" ? "حساب تجاري" : "حساب فردي"} />
              </div>

              {user?.account_type === "business" && (
                <div className="pt-6 border-t border-border/40 space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <InfoItem icon={<ShieldCheck className="h-4 w-4" />} label="اسم النشاط التجاري" value={user?.business_account?.business_name || "غير متوفر"} />
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">وصف النشاط</p>
                        <div className="p-4 bg-background/40 rounded-2xl border border-border/40 text-sm font-medium leading-relaxed italic text-muted-foreground">
                            {user?.business_account?.business_description || user?.contact_data || "لا يوجد وصف متوفر"}
                        </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Notifications Card */}
          <Card className="border-border/40 shadow-xl shadow-black/5 bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2.5rem]">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-4 mb-2">
                 <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 shadow-inner">
                    <Bell className="h-6 w-6" />
                 </div>
                 <div>
                    <CardTitle className="text-xl font-black">مركز التنبيهات الإداري</CardTitle>
                    <CardDescription className="font-bold text-muted-foreground/70">تخصيص كيفية تلقي تنبيهات النظام</CardDescription>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4">
               {[
                  { id: 'email-notif', label: 'إشعارات البريد الإلكتروني', desc: 'تلقي ملخصات يومية وتقارير النشاط', checked: true },
                  { id: 'browser-notif', label: 'إشعارات المتصفح', desc: 'تنبيهات فورية عند حدوث إجراءات هامة', checked: false }
               ].map((item, idx) => (
                  <div key={item.id}>
                      <div className="flex items-center justify-between py-6 group hover:bg-muted/30 transition-colors px-4 rounded-2xl">
                          <div className="space-y-1">
                              <Label className="text-base font-black group-hover:text-primary transition-colors cursor-pointer" htmlFor={item.id}>{item.label}</Label>
                              <p className="text-xs font-bold text-muted-foreground group-hover:text-muted-foreground/100 transition-colors">{item.desc}</p>
                          </div>
                          <Switch id={item.id} defaultChecked={item.checked} className="data-[state=checked]:bg-primary" />
                      </div>
                      {idx !== 1 && <Separator className="bg-border/40" />}
                  </div>
               ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
            <Card className="border-border/40 shadow-xl shadow-black/5 bg-gradient-to-br from-primary/10 via-background to-blue-500/5 rounded-[2.5rem] p-8">
                <div className="flex flex-col items-center text-center space-y-5">
                    <div className="relative group">
                        <Avatar className="h-28 w-28 border-4 border-background shadow-2xl transition-transform duration-500 group-hover:scale-105">
                            <AvatarImage src={user?.image || ""} className="object-cover" />
                            <AvatarFallback className="bg-primary text-white font-black text-3xl">
                                {getInitials()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm cursor-pointer border-4 border-white/20">
                            <Settings className="text-white h-8 w-8 animate-spin-slow" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black tracking-tight">{user?.first_name} {user?.last_name}</h3>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{user?.account_type === "business" ? "حساب تجاري" : "حساب فردي"}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        {user?.roles?.map(role => getRoleBadge(role))}
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-border/40 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground">معرف المستخدم</span>
                        <span className="text-[10px] font-black font-mono bg-muted px-2 py-0.5 rounded tabular-nums">ID: {user?.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground">آخر تحديث</span>
                        <span className="text-[10px] font-black tabular-nums">{user?.updated_at ? new Date(user.updated_at).toLocaleDateString("en-GB") : "—"}</span>
                    </div>
                    <div className="flex flex-col gap-2 pt-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-muted-foreground">حالة الحساب</span>
                            {user?.account_verified ? (
                                <CustomBadge variant="active" className="bg-emerald-500/10 text-emerald-600 border-none h-5 text-[10px]">موثق</CustomBadge>
                            ) : (
                                <CustomBadge variant="blocked" className="h-5 text-[10px]">غير موثق</CustomBadge>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            <div className="p-6 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10 active:scale-95 transition-all cursor-pointer">
                <div className="flex items-center gap-3 text-emerald-600 mb-3">
                    <ShieldCheck className="h-5 w-5" />
                    <h4 className="font-black text-sm">الجلسة آمنة</h4>
                </div>
                <p className="text-[11px] font-bold text-muted-foreground leading-relaxed">
                    يتم تشفير كافة البيانات المرسلة من وإلى لوحة التحكم عبر بروتوكول SSL لضمان أقصى درجات الخصوصية.
                </p>
                <div className="mt-4 pt-4 border-t border-emerald-500/10 text-center">
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">تحقق من سجل الأمان</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
