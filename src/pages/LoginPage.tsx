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
import { Separator } from "@/components/ui/separator"
import { SYRIA_COUNTRY } from "@/constants/phone"
import { useProvider } from "@/context/MainProvider"
import { cleanPhoneNumber } from "@/lib/helpFunctions"
import { Loader2, Shield, User } from "lucide-react"
import { useEffect, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
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

  // Simulate loading countries from an API
  useEffect(() => {
    setIsLoadingCountries(true);
    const timer = setTimeout(() => {
      setIsLoadingCountries(false);
    }, 1000);
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
    setIsLoading(true);
    try {
      const identifier = countryCode.dialCode + cleanPhoneNumber(phoneNumber);
      await sendLoginOtp(identifier);
      setStep("otp");
      toast.success("تم إرسال رمز التحقق بنجاح");
    } catch (error) {
      toast.error("فشل إرسال رمز التحقق");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 4) {
      toast.error("يرجى إدخال 4 أرقام");
      return;
    }
    setIsLoading(true);
    try {
      const identifier = countryCode.dialCode + cleanPhoneNumber(phoneNumber);
      await verifyOtp(identifier, otpCode);
    } catch (error) {
      toast.error("رمز التحقق غير صحيح");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4"
      style={{ direction: "rtl" }}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">شفلي</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">أهلاً بك مجدداً</CardTitle>
          <CardDescription className="text-center">
            {step === "phone"
              ? "قم بتسجيل الدخول إلى لوحة تحكم المدير"
              : "أدخل رمز التحقق المكون من 4 أرقام"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="flex flex-row">
                {/* Phone number input */}
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  disabled={isLoading}
                  className="rounded-l-none border-l-0 pl-3"
                  placeholder="رقم الهاتف"
                  style={{ direction: "ltr" }}
                  required
                />

                <Select
                  value={countryCode.dialCode}
                  onValueChange={handleCountryChange}
                  disabled={isLoadingCountries}
                >
                  <SelectTrigger className="w-[120px] rounded-r-none">
                    {isLoadingCountries ? (
                      <div className="flex items-center">
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        <span>جاري التحميل...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="الدولة" />
                    )}
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {countriesDialCodes.map((country) => (
                      <SelectItem key={country.code} value={country.dialCode}>
                        {country.dialCode} {country.flag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">رمز التحقق</Label>
                <Input
                  id="otp"
                  type="text"
                  maxLength={4}
                  placeholder="0 0 0 0"
                  className="text-center text-2xl tracking-[1em]"
                  style={{ direction: "ltr" }}
                  value={otpCode}
                  onChange={(e) =>
                    setOtpCode(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "جاري التحقق..." : "تأكيد الدخول"}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setStep("phone")}
                disabled={isLoading}
              >
                العودة لتعديل الرقم
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground flex flex-col gap-2">
          <span>قوة في الأداء.. سهولة في التحكم</span>
        </CardFooter>
      </Card>
    </div>
  );
};
