import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  return (
    <div className="space-y-6" style={{ direction: "rtl" }}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">الإعدادات</h1>
        <p className="text-muted-foreground">إدارة إعدادات التطبيق وتفضيلاتك</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>الإعدادات العامة</CardTitle>
            <CardDescription>التكوين الأساسي للتطبيق</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="app-name">اسم التطبيق</Label>
              <Input id="app-name" defaultValue="لوحة تحكم شفلي" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="app-description">الوصف</Label>
              <Input id="app-description" defaultValue="لوحة تحكم المدير لتطبيق شفلي" />
            </div>
            <Button>حفظ التغييرات</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الإشعارات</CardTitle>
            <CardDescription>تكوين كيفية تلقي الإشعارات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>إشعارات البريد الإلكتروني</Label>
                <p className="text-sm text-muted-foreground">تلقي الإشعارات عبر البريد الإلكتروني</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>إشعارات المتصفح</Label>
                <p className="text-sm text-muted-foreground">تلقي إشعارات الدفع في المتصفح</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>إشعارات SMS</Label>
                <p className="text-sm text-muted-foreground">تلقي الإشعارات عبر SMS</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الأمان</CardTitle>
            <CardDescription>إدارة تفضيلات الأمان الخاصة بك</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>المصادقة الثنائية</Label>
                <p className="text-sm text-muted-foreground">أضف طبقة إضافية من الأمان إلى حسابك</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>مهلة الجلسة</Label>
                <p className="text-sm text-muted-foreground">تسجيل الخروج تلقائياً بعد عدم النشاط</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button variant="outline">تغيير كلمة المرور</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
