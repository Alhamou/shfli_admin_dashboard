import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SYRIA_COUNTRY } from "@/constants/phone"
import { useProvider } from "@/context/MainProvider"
import { cleanPhoneNumber } from "@/lib/helpFunctions"
import { ArrowRight, ChevronLeft, Loader2, Lock, MessageSquare, Phone, Shield, ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "../../app"

export const LoginPage = () => {
  const { isAuthenticated, sendLoginOtp, verifyOtp } = useAuth();
  const { countriesDialCodes, countryCode, setCountryCode } = useProvider();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoadingCountries(true);
    const timer = setTimeout(() => {
      setIsLoadingCountries(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/[^0-9]/g, "");
    setPhoneNumber(num);
  };

  const handleCountryChange = (code: string) => {
    const country =
      countriesDialCodes.find((c) => c.dialCode === code) || SYRIA_COUNTRY;
    setCountryCode(country);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 7) {
        toast.error("يرجى إدخال رقم هاتف صحيح");
        return;
    }
    setIsLoading(true);
    try {
      const identifier = countryCode.dialCode + cleanPhoneNumber(phoneNumber);
      await sendLoginOtp(identifier);
      setStep("otp");
      toast.success("تم إرسال رمز التحقق بنجاح");
    } catch (error) {
      toast.error("فشل إرسال رمز التحقق، يرجى المحاولة لاحقاً");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 4) {
      toast.error("يرجى إدخال 4 أرقام لرمز التحقق");
      return;
    }
    setIsLoading(true);
    try {
      const identifier = countryCode.dialCode + cleanPhoneNumber(phoneNumber);
      await verifyOtp(identifier, otpCode);
    } catch (error) {
      toast.error("رمز التحقق غير صحيح أو انتهت صلاحيته");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background font-sans selection:bg-primary/20" style={{ direction: "rtl" }}>
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute top-[20%] right-[-5%] w-[20%] h-[20%] bg-emerald-500/10 rounded-full blur-[100px] animate-bounce duration-[10s]"></div>

      <div className="w-full max-w-sm z-10 p-4">
        <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="h-20 w-20 rounded-[2rem] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-2xl shadow-primary/40 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
              <Shield className="h-10 w-10 text-white drop-shadow-lg" />
           </div>
           <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-2">
              شُـفلي <span className="text-primary">.</span>
           </h1>
           <p className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] mt-2">إدارة النظـام الذكيـة</p>
        </div>

        <Card className="border-border/40 shadow-2xl shadow-black/10 bg-card/40 backdrop-blur-2xl overflow-hidden rounded-[2.5rem] border-t-0 animate-in zoom-in-95 duration-700 transition-all hover:shadow-primary/5">
            <CardHeader className="p-8 pb-4 text-center space-y-2">
                <CardTitle className="text-2xl font-black">
                    {step === "phone" ? "تسجـيل الدخول" : "تأكيد الهوية"}
                </CardTitle>
                <CardDescription className="font-bold text-muted-foreground/70 leading-relaxed px-4">
                    {step === "phone"
                      ? "أدخل رقم هاتفك للوصول إلى لوحة الإدارة العليا للمنصة"
                      : `أدخل الرمز المرسل إلى الرقم ${phoneNumber}`}
                </CardDescription>
            </CardHeader>

            <CardContent className="p-8 pt-4">
                {step === "phone" ? (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                        <div className="space-y-2.5">
                            <Label className="font-black text-xs px-2 flex items-center gap-2">
                                <Phone className="h-3 w-3 text-primary" /> رقم الجوال
                            </Label>
                            <div className="flex gap-2">
                                <Select
                                    value={countryCode.dialCode}
                                    onValueChange={handleCountryChange}
                                    disabled={isLoadingCountries}
                                >
                                    <SelectTrigger className="w-[100px] h-14 rounded-2xl bg-background/50 border-transparent focus:ring-4 focus:ring-primary/10 transition-all font-black text-sm">
                                        {isLoadingCountries ? (
                                            <Loader2 className="h-4 w-4 animate-spin mx-auto text-primary" />
                                        ) : (
                                            <SelectValue />
                                        )}
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-border/40 backdrop-blur-xl">
                                        {countriesDialCodes.map((country) => (
                                            <SelectItem key={country.code} value={country.dialCode} className="font-bold rounded-xl py-3 focus:bg-primary/10">
                                                <span className="flex items-center gap-2">
                                                    <span className="text-lg">{country.flag}</span>
                                                    <span className="tabular-nums">{country.dialCode}</span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={handlePhoneChange}
                                    disabled={isLoading}
                                    placeholder="000 000 000"
                                    className="flex-1 h-14 bg-background/50 border-transparent focus:bg-background focus:ring-4 focus:ring-primary/10 rounded-2xl transition-all font-black text-lg tracking-wider tabular-nums placeholder:tracking-normal placeholder:font-normal placeholder:opacity-30"
                                    style={{ direction: "ltr" }}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98] group"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-3">
                                    إرسال رمز الدخول
                                    <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                                </span>
                            )}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div className="space-y-4">
                            <Label className="font-black text-xs px-2 flex items-center gap-2 justify-center mb-2">
                                <Lock className="h-3 w-3 text-primary" /> رمز التحقق المكون من 4 أرقام
                            </Label>
                            <Input
                                id="otp"
                                type="text"
                                maxLength={4}
                                placeholder="0 0 0 0"
                                className="h-20 text-center text-4xl font-black tracking-[0.5em] bg-background/50 border-transparent focus:bg-background focus:ring-4 focus:ring-primary/10 rounded-3xl transition-all tabular-nums shadow-inner"
                                style={{ direction: "ltr" }}
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="space-y-3">
                            <Button
                                type="submit"
                                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center gap-3"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <>
                                        <ShieldCheck className="h-5 w-5" />
                                        تأكيد الدخول الآمن
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                type="button"
                                className="w-full h-12 rounded-xl text-muted-foreground font-black hover:text-foreground transition-colors text-sm"
                                onClick={() => setStep("phone")}
                                disabled={isLoading}
                            >
                                العودة لتغيير رقم الهاتف
                            </Button>
                        </div>
                    </form>
                )}
            </CardContent>

            <CardFooter className="bg-muted/30 p-8 border-t border-border/40 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    مشفر بالكامل (SSL Secure)
                </div>
                <p className="text-[11px] font-bold text-muted-foreground text-center leading-relaxed">
                   استخدامك لهذه اللوحة يعني موافقتك على كامل الصلاحيات الإدارية المنوطة بك.
                </p>
            </CardFooter>
        </Card>

        {/* Footer Links */}
        <div className="mt-8 flex items-center justify-center gap-6">
            <button className="text-[10px] font-black text-muted-foreground/60 hover:text-primary transition-colors uppercase tracking-widest">الدعم الفني</button>
            <div className="h-1 w-1 rounded-full bg-border/40"></div>
            <button className="text-[10px] font-black text-muted-foreground/60 hover:text-primary transition-colors uppercase tracking-widest">سياسة الأمان</button>
        </div>
      </div>
    </div>
  );
};
