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
import { Navigate } from "react-router-dom"
import { useAuth } from "../../app"

export const LoginPage = () => {
    const { isAuthenticated, login } = useAuth()
  const {countriesDialCodes,countryCode,setCountryCode} = useProvider()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoadingCountries, setIsLoadingCountries] = useState(false)
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

    // Simulate loading countries from an API
  useEffect(() => {
    setIsLoadingCountries(true)
    const timer = setTimeout(() => {
      setIsLoadingCountries(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/[^0-9]/g, "")
    setPhoneNumber(num)
  }

  const handleCountryChange = (code: string) => {
    const country = countriesDialCodes.find((c) => c.dialCode === code) || SYRIA_COUNTRY
    setCountryCode(country)
  }

    const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    await login({identifier : countryCode.dialCode + cleanPhoneNumber(phoneNumber),password : password})
    setIsLoading(false)
  }

    const handleGuestLogin = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsLoading(false)
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4" style={{ direction: "rtl" }}>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">شفلي</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">أهلاً بك مجدداً</CardTitle>
          <CardDescription className="text-center">قم بتسجيل الدخول إلى لوحة تحكم المدير</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex flex-row">
      <Select
        value={countryCode.dialCode}
        onValueChange={handleCountryChange}
        disabled={isLoadingCountries}
      >
        <SelectTrigger className="w-[120px] rounded-l-none border-l-0">
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
          {countriesDialCodes.map(country => (
            <SelectItem key={country.code} value={country.dialCode}>
              {country.dialCode} {country.flag}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Phone number input */}
      <Input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneChange}
        disabled={isLoading}
        className="rounded-r-none pr-3"
        placeholder="رقم الهاتف"
      />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="أدخل كلمة المرور الخاصة بك"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">أو</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGuestLogin} disabled={isLoading}>
            <User className="ml-2 h-4 w-4" />
            {isLoading ? "جاري تسجيل الدخول..." : "تسجيل دخول كضيف"}
          </Button>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          بيانات التجربة: أي هاتف وكلمة مرور سيعملان
        </CardFooter>
      </Card>
    </div>
  )
}
