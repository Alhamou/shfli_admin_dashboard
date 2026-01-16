import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomBadge } from "@/components/ui/custom-badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Bell, Globe, Lock, Settings, ShieldCheck, User } from "lucide-react"

export default function SettingsPage() {
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
        {/* Navigation / Shortcuts - Optional but can be added later if needed */}

        <div className="lg:col-span-2 space-y-8">
          {/* General Settings */}
          <Card className="border-border/40 shadow-xl shadow-black/5 bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2.5rem]">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-4 mb-2">
                 <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-inner">
                    <Globe className="h-6 w-6" />
                 </div>
                 <div>
                    <CardTitle className="text-xl font-black">الإعدادات العامة</CardTitle>
                    <CardDescription className="font-bold text-muted-foreground/70">التكوين الأساسي لمنصة شفلي</CardDescription>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2.5">
                  <Label htmlFor="app-name" className="font-black text-sm px-2">اسم التطبيق</Label>
                  <Input
                    id="app-name"
                    defaultValue="لوحة تحكم شفلي"
                    className="h-12 bg-background/50 border-transparent focus:bg-background focus:ring-4 focus:ring-primary/10 rounded-xl transition-all font-medium"
                   />
                </div>
                <div className="grid gap-2.5">
                  <Label htmlFor="app-description" className="font-black text-sm px-2">وصف المنصة</Label>
                  <Input
                    id="app-description"
                    defaultValue="لوحة تحكم المدير لتطبيق شفلي"
                    className="h-12 bg-background/50 border-transparent focus:bg-background focus:ring-4 focus:ring-primary/10 rounded-xl transition-all font-medium"
                  />
                </div>
              </div>
              <div className="pt-4">
                <Button className="rounded-xl px-8 font-black shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95">حفظ التغييرات</Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Settings */}
          <Card className="border-border/40 shadow-xl shadow-black/5 bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2.5rem]">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-4 mb-2">
                 <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 shadow-inner">
                    <Bell className="h-6 w-6" />
                 </div>
                 <div>
                    <CardTitle className="text-xl font-black">مركز التنبيهات</CardTitle>
                    <CardDescription className="font-bold text-muted-foreground/70">تخصيص قنوات التواصل والإشعارات</CardDescription>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-0">
              <div className="space-y-0">
                 {[
                    { id: 'email', label: 'إشعارات البريد الإلكتروني', desc: 'تلقي ملخصات يومية وتقارير عبر البريد', checked: true },
                    { id: 'browser', label: 'إشعارات المتصفح', desc: 'إظهار تنبيهات فورية على سطح المكتب', checked: false },
                    { id: 'sms', label: 'إشعارات الرسائل القصيرة (SMS)', desc: 'تلقي تنبيهات الطوارئ والتحقق', checked: false }
                 ].map((item, idx) => (
                    <div key={item.id}>
                        <div className="flex items-center justify-between py-6 group hover:bg-muted/30 transition-colors px-2 rounded-xl">
                            <div className="space-y-1">
                                <Label className="text-base font-black group-hover:text-primary transition-colors cursor-pointer" htmlFor={item.id}>{item.label}</Label>
                                <p className="text-xs font-bold text-muted-foreground group-hover:text-muted-foreground/100 transition-colors">{item.desc}</p>
                            </div>
                            <Switch id={item.id} defaultChecked={item.checked} className="data-[state=checked]:bg-primary" />
                        </div>
                        {idx !== 2 && <Separator className="bg-border/40" />}
                    </div>
                 ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border-border/40 shadow-xl shadow-black/5 bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2.5rem]">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-4 mb-2">
                 <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-inner">
                    <Lock className="h-6 w-6" />
                 </div>
                 <div>
                    <CardTitle className="text-xl font-black">الأمان والخصوصية</CardTitle>
                    <CardDescription className="font-bold text-muted-foreground/70">حماية حسابك وبيانات المنصة</CardDescription>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="space-y-0">
                 {[
                    { id: '2fa', label: 'المصادقة الثنائية (2FA)', desc: 'إضافة طبقة حماية إضافية عبر تطبيق Google Authenticator', checked: false },
                    { id: 'session', label: 'إدارة الجلسات التلقائية', desc: 'تسجيل الخروج تلقائياً بعد 30 دقيقة من عدم النشاط', checked: true }
                 ].map((item, idx) => (
                    <div key={item.id}>
                        <div className="flex items-center justify-between py-6 group hover:bg-muted/30 transition-colors px-2 rounded-xl">
                            <div className="space-y-1">
                                <Label className="text-base font-black group-hover:text-emerald-600 transition-colors cursor-pointer" htmlFor={item.id}>{item.label}</Label>
                                <p className="text-xs font-bold text-muted-foreground group-hover:text-muted-foreground/100 transition-colors">{item.desc}</p>
                            </div>
                            <Switch id={item.id} defaultChecked={item.checked} className="data-[state=checked]:bg-emerald-500" />
                        </div>
                        {idx !== 1 && <Separator className="bg-border/40" />}
                    </div>
                 ))}
              </div>
              <div className="pt-4 flex gap-4">
                <Button variant="outline" className="rounded-xl border-border/40 font-black hover:bg-muted/50 transition-all flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> تغيير كلمة المرور
                </Button>
                <Button variant="ghost" className="rounded-xl text-muted-foreground font-black hover:text-foreground transition-all">سجل الأمان</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
            <Card className="border-border/40 shadow-xl shadow-black/5 bg-gradient-to-br from-primary/10 to-transparent rounded-[2.5rem] p-8">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-24 w-24 rounded-full border-4 border-background shadow-2xl relative group overflow-hidden">
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer z-10">
                            <User className="text-white h-8 w-8" />
                        </div>
                        <div className="h-full w-full bg-muted flex items-center justify-center text-primary font-black text-3xl">
                             AD
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-black">أدمن شفلي</h3>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">إدارة النظام العليا</p>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-border/40 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground">آخر دخول</span>
                        <span className="text-xs font-black tabular-nums">اليوم، 10:45 AM</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground">مستوى الوصول</span>
                        <CustomBadge variant="active" size="lg" className="h-6 text-[10px]">مكتمل</CustomBadge>
                    </div>
                </div>
            </Card>

            <div className="p-6 rounded-[2rem] bg-orange-500/5 border border-orange-500/10">
                <div className="flex items-center gap-3 text-orange-600 mb-3">
                    <ShieldCheck className="h-5 w-5" />
                    <h4 className="font-black text-sm">نصيحة أمان</h4>
                </div>
                <p className="text-[11px] font-bold text-muted-foreground leading-relaxed">
                    ننصح بتفعيل المصادقة الثنائية لجميع حسابات مدراء النظام لتجنب الوصول غير المصرح به لقواعد البيانات الحساسة.
                </p>
            </div>
        </div>
      </div>
    </div>
  )
}
