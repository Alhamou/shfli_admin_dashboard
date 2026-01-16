import { AnnouncementDialog } from "@/components/FirebaseAnnouncement";
import { SendNotificationPopup } from "@/components/SendNotificationPopup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { connectSocket, socket } from "@/controllers/requestController";
import { sendFirebase, sendNotAdmin } from "@/services/restApiServices";
import { Bell, Megaphone, ShieldAlert, Sparkles, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Admin() {
  const [loadingNotification, setLoadingNotification] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const handleSendNotification = async (messageData: any) => {
    setLoadingNotification(true);
    try {
      await sendNotAdmin(messageData);
      toast.success("تم إرسال الإشعار بنجاح");
    } catch {
      toast.error("فشل في إرسال الإشعار");
    } finally {
      setLoadingNotification(false);
    }
  };

  const handleSendAnnouncement = async (data: {
    title: string;
    description: string;
  }) => {
    try {
      await sendFirebase(data);
      toast.success("تم إرسال الإعلان بنجاح");
    } catch {
      toast.error("فشل في إرسال الإعلان");
    }
  };

  useEffect(() => {
    connectSocket();

    const onConnect = () => {
      console.log("Connected socket");
      setIsSocketConnected(true);
    };

    const onDisconnect = () => {
      console.log("Socket disconnected");
      setIsSocketConnected(false);
    };

    const onError = (err: Error) => {
      console.error("Socket error:", err.message);
      setIsSocketConnected(false);
    };

    const onMessage = (message: any) => {
      console.log("new item received", message);
    };

    const checkConnectionInterval = setInterval(() => {
      if (!socket.connected) {
        socket.connect();
      }
    }, 5000);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onError);
    socket.on("log_data", onMessage);

    setIsSocketConnected(socket.connected);

    return () => {
      clearInterval(checkConnectionInterval);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onError);
      socket.off("log_data", onMessage);
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-inner">
                <ShieldAlert className="h-5 w-5" />
             </div>
             <h1 className="text-2xl font-black tracking-tight text-foreground">لوحة التحكم الإدارية</h1>
          </div>
          <p className="text-muted-foreground font-medium mr-13">إرسال التنبيهات والإعلانات لمستخدمي التطبيق</p>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${isSocketConnected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-red-500/10 border-red-500/20 text-red-600'}`}>
            {isSocketConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span className="text-sm font-bold">{isSocketConnected ? 'متصل بالخدمة' : 'جاري الاتصال...'}</span>
        </div>
      </div>

      {/* Admin Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Send Notification Card */}
        <Card className="group border-border/40 shadow-xl shadow-black/5 bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2.5rem] hover:shadow-2xl transition-all duration-500">
          <CardHeader className="p-8 pb-4">
            <div className="h-16 w-16 rounded-[1.5rem] bg-blue-500/10 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
               <Bell className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-black">إشعارات عامة</CardTitle>
            <CardDescription className="text-base font-medium leading-relaxed">إرسال إشعارات فورية لجميع مستخدمي التطبيق عبر الخدمات السحابية.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <div className="space-y-6">
                <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm font-bold text-muted-foreground/80">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                        وصول فوري لجميع الأجهزة النشطة
                    </li>
                    <li className="flex items-center gap-3 text-sm font-bold text-muted-foreground/80">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                        دعم الروابط العميقة (Deep Links)
                    </li>
                    <li className="flex items-center gap-3 text-sm font-bold text-muted-foreground/80">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                        تخصيص أيقونات الإشعارات
                    </li>
                </ul>

                <SendNotificationPopup
                    is_public={true}
                    userId={1}
                    loading={loadingNotification}
                    onSend={handleSendNotification}
                >
                    <Button className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 font-black text-lg transition-all active:scale-95 flex items-center gap-3">
                        <Sparkles className="h-5 w-5" />
                        بدء إرسال الإشعار
                    </Button>
                </SendNotificationPopup>
            </div>
          </CardContent>
        </Card>

        {/* Send Announcement Card */}
        <Card className="group border-border/40 shadow-xl shadow-black/5 bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2.5rem] hover:shadow-2xl transition-all duration-500">
          <CardHeader className="p-8 pb-4">
            <div className="h-16 w-16 rounded-[1.5rem] bg-orange-500/10 flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
               <Megaphone className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-black">إعلانات التطبيق</CardTitle>
            <CardDescription className="text-base font-medium leading-relaxed">عرض نافذة إعلانية منبثقة تظهر للمستخدمين عند فتح التطبيق.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <div className="space-y-6">
                <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm font-bold text-muted-foreground/80">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                        تنبيهات الصيانة والتحديثات الهامة
                    </li>
                    <li className="flex items-center gap-3 text-sm font-bold text-muted-foreground/80">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                        العروض الترويجية والخصومات الجديدة
                    </li>
                    <li className="flex items-center gap-3 text-sm font-bold text-muted-foreground/80">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                        إمكانية إضافة صور وروابط تفاعلية
                    </li>
                </ul>

                <AnnouncementDialog onSend={handleSendAnnouncement}>
                    <Button className="w-full h-16 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20 font-black text-lg transition-all active:scale-95 flex items-center gap-3">
                        <Megaphone className="h-5 w-5" />
                        إنشاء إعلان جديد
                    </Button>
                </AnnouncementDialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
         <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <Megaphone className="h-6 w-6" />
         </div>
         <div className="space-y-1">
            <h4 className="font-black text-foreground">تنبيه أمان الاستخدام</h4>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">تذكر أن الإشعارات العامة تصل لجميع المستخدمين المسجلين في النظام. يرجى مراجعة المحتوى بعناية قبل الإرسال لتجنب الإزعاج أو الأخطاء اللغوية.</p>
         </div>
      </div>
    </div>
  );
}
