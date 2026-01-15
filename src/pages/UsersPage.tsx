import { SendNotificationPopup } from "@/components/SendNotificationPopup";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { CustomBadge } from "@/components/ui/custom-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { IUser } from "@/interfaces";
import { getUserInfo, putUserInfo, sendNotTeam } from "@/services/restApiServices";
import { AlertCircle, Edit, MessageCircle, Save, Search, User, Users, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const UserInfo = () => {
    const [userId, setUserId] = useState("");
  const [userData, setUserData] = useState<IUser | null>(null);
  const [editData, setEditData] = useState<Partial<IUser>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingNotification, setLoadingNotification] = useState(false);

  const handleFetchUser = async () => {
    if (!userId.trim()) {
      setError("الرجاء إدخال ID المستخدم");
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsEditing(false);
    setEditData({});

    try {
      const data = await getUserInfo(userId);
      setUserData(data);
    } catch (error) {
      setError("ID غير صالح. يُرجى المحاولة مرة أخرى.");
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof IUser, value: any) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveChanges = async () => {
    if (!userData) return;

    setIsLoading(true);
    try {
      // Prepare the data to send
      const dataToSend = {
        ...editData,
        id: userData.id,
        // If deleted_at is being set, ensure we send it
        ...(editData.deleted_at !== undefined && {
          deleted_at: editData.deleted_at,
        }),
        // Also update the deleted flag if we're changing deleted_at
        ...(editData.deleted_at !== undefined && {
          deleted: !!editData.deleted_at,
        }),
      };

      const updatedUser = await putUserInfo(dataToSend);
      handleFetchUser();
      setEditData({});
      setIsEditing(false);
      toast.success("تم تحديث المستخدم بنجاح");
    } catch (error) {
      toast.error("فشل في تحديث المستخدم");
      console.error("Error updating user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "غير متوفر";
    return new Date(date).toLocaleDateString();
  };

  const formatBoolean = (value: boolean | null) => {
    if (value === null) return "غير متوفر";
    return value ? "نعم" : "لا";
  };

  const getAccountTypeBadge = (type: "individual" | "business") => {
    return type === "individual" ? (
      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
        <User className="h-3 w-3 mr-1" />
        فرد
      </Badge>
    ) : (
      <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0">
        <Users className="h-3 w-3 mr-1" />
        عمل
      </Badge>
    );
  };

  const getUserInitials = () => {
    if (userData?.first_name || userData?.last_name) {
      return `${userData?.first_name?.charAt(0) || ""}${userData?.last_name?.charAt(0) || ""}`.toUpperCase();
    }
    return "م";
  };

  return (
    <div
      className="mx-auto"
      style={{ direction: "rtl" }}
    >
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
          <Users className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">معلومات المستخدم</h1>
          <p className="text-sm text-muted-foreground">
            ابحث عن مستخدم لعرض وتعديل بياناته
          </p>
        </div>
      </div>

      {/* Search Section */}
      <Card className="shadow-sm border-border/50 mb-6">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="أدخل معرف المستخدم أو البريد الإلكتروني"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setError(null);
                }}
                className="pr-10 bg-background border-border/50 focus:border-primary transition-colors"
                style={{ direction: "ltr" }}
              />
              {userId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setUserId("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              onClick={handleFetchUser}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 shadow-sm"
            >
              {isLoading ? "جاري التحميل..." : "بحث"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {userData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Information Card */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-md">
                    {userData.image ? (
                      <AvatarImage src={userData.image} alt="User" />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xl font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Input
                          defaultValue={userData.first_name || ""}
                          onChange={(e) => handleInputChange("first_name", e.target.value)}
                          placeholder="الاسم"
                          className="w-28 h-8"
                        />
                        <Input
                          defaultValue={userData.last_name || ""}
                          onChange={(e) => handleInputChange("last_name", e.target.value)}
                          placeholder="الكنية"
                          className="w-28 h-8"
                        />
                      </div>
                    ) : (
                      <h2 className="text-xl font-bold">
                        {userData.first_name ?? ""} {userData.last_name ?? ""}
                      </h2>
                    )}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {getAccountTypeBadge(userData.account_type)}
                      {userData.blocked && (
                        <Badge variant="destructive">محظور</Badge>
                      )}
                      {userData.account_verified && (
                        <CustomBadge variant="active">موثق</CustomBadge>
                      )}
                      {userData.deleted_at && (
                        <Badge variant="destructive">محذوف</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                      >
                        <Edit className="h-4 w-4 ml-2" />
                        تعديل
                      </Button>
                      <SendNotificationPopup
                        is_public={false}
                        userId={userData.id}
                        loading={loadingNotification}
                        onSend={async (messageData) => {
                          setLoadingNotification(true);
                          try {
                            await sendNotTeam(messageData);
                            toast.success("تم إرسال الإشعار بنجاح");
                          } catch {
                            toast.error("فشل إرسال الإشعار");
                          } finally {
                            setLoadingNotification(false);
                          }
                        }}
                      >
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 ml-2" /> إشعار
                        </Button>
                      </SendNotificationPopup>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                        className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                      >
                        <X className="h-4 w-4 ml-2" />
                        إلغاء
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveChanges}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Save className="h-4 w-4 ml-2" />
                        حفظ
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">المعلومات الأساسية</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                    <p className="text-sm font-medium">{userData.email || "غير متوفر"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">رقم الهاتف</p>
                    {isEditing ? (
                      <Input
                        defaultValue={userData.phone_number || ""}
                        onChange={(e) => handleInputChange("phone_number", e.target.value)}
                        dir="ltr"
                        className="h-8"
                      />
                    ) : (
                      <p className="text-sm font-medium" style={{ direction: "ltr", textAlign: "right" }}>
                        {userData.phone_number || "غير متوفر"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">تاريخ الميلاد</p>
                    <p className="text-sm font-medium">{formatDate(userData.birth_date)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">تاريخ الإنشاء</p>
                    <p className="text-sm font-medium">{formatDate(userData.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">حالة الحساب</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">موثق</p>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Switch
                          id="account-verified"
                          checked={editData.account_verified ?? userData.account_verified ?? false}
                          onCheckedChange={(checked) => handleInputChange("account_verified", checked)}
                          style={{ direction: "ltr" }}
                        />
                        <Label htmlFor="account-verified" className="text-sm">
                          {formatBoolean(editData.account_verified ?? userData.account_verified)}
                        </Label>
                      </div>
                    ) : (
                      <p className="text-sm font-medium">{formatBoolean(userData.account_verified)}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">الهاتف موثق</p>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Switch
                          id="phone-verified"
                          checked={editData.phone_verified ?? userData.phone_verified ?? false}
                          onCheckedChange={(checked) => handleInputChange("phone_verified", checked)}
                          style={{ direction: "ltr" }}
                        />
                        <Label htmlFor="phone-verified" className="text-sm">
                          {formatBoolean(editData.phone_verified ?? userData.phone_verified)}
                        </Label>
                      </div>
                    ) : (
                      <p className="text-sm font-medium">{formatBoolean(userData.phone_verified)}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">محظور</p>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Switch
                          id="blocked"
                          checked={editData.blocked ?? userData.blocked ?? false}
                          onCheckedChange={(checked) => handleInputChange("blocked", checked)}
                          style={{ direction: "ltr" }}
                        />
                        <Label htmlFor="blocked" className="text-sm">
                          {formatBoolean(editData.blocked ?? userData.blocked)}
                        </Label>
                      </div>
                    ) : (
                      <p className="text-sm font-medium">{formatBoolean(userData.blocked)}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">محذوف</p>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Switch
                          id="deleted"
                          checked={!!(editData.deleted_at ?? userData.deleted_at)}
                          onCheckedChange={(checked) => {
                            handleInputChange("deleted_at", checked ? new Date().getTime() : null);
                          }}
                          style={{ direction: "ltr" }}
                        />
                        <Label htmlFor="deleted" className="text-sm">
                          {formatBoolean(!!(editData.deleted_at ?? userData.deleted_at))}
                        </Label>
                      </div>
                    ) : (
                      <p className="text-sm font-medium">
                        {userData.deleted_at
                          ? `نعم (${formatDate(userData.deleted_at)})`
                          : "لا"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">معلومات إضافية</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">الأدوار</p>
                    <div className="flex gap-1 flex-wrap">
                      {userData.roles.length > 0 ? (
                        userData.roles.map((role) => (
                          <Badge key={role} variant="secondary" className="text-xs">
                            {role}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">غير متوفر</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">معلومات الاتصال</p>
                    {isEditing ? (
                      <Textarea
                        defaultValue={userData.contact_data || ""}
                        onChange={(e) => handleInputChange("contact_data", e.target.value)}
                        className="min-h-[80px]"
                      />
                    ) : (
                      <p className="text-sm">{userData.contact_data || "غير متوفر"}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground border-t pt-4 flex flex-col items-start gap-1">
              <span>ID: {userData.id}</span>
              <span className="break-all" style={{ direction: "ltr" }}>UUID: {userData.uuid}</span>
            </CardFooter>
          </Card>

          {/* Business Information Card */}
          {userData.account_type === "business" && (
            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  معلومات العمل
                  {userData.business_account?.business_name && (
                    <span className="text-muted-foreground font-normal">
                      - {userData.business_account?.business_name}
                    </span>
                  )}
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">نوع العمل</p>
                    <p className="text-sm font-medium">
                      {userData.business_account?.business_type?.ar || "غير متوفر"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">البريد الإلكتروني للعمل</p>
                    <p className="text-sm font-medium">
                      {userData.business_account?.business_email || "غير متوفر"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">هاتف العمل</p>
                    <p className="text-sm font-medium" style={{ direction: "ltr", textAlign: "right" }}>
                      {userData.business_account?.business_phone_number || "غير متوفر"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">الرقم الضريبي</p>
                    <p className="text-sm font-medium">
                      {userData.business_account?.tax_number || "غير متوفر"}
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-xs text-muted-foreground">عنوان العمل</p>
                    <p className="text-sm font-medium">
                      {userData.business_account?.business_address || "غير متوفر"}
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-xs text-muted-foreground">رابط الموقع</p>
                    {userData.business_account?.website_url ? (
                      <a
                        href={userData.business_account?.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {userData.business_account?.website_url}
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">غير متوفر</p>
                    )}
                  </div>
                </div>
              </CardContent>
              {userData.business_account?.business_description && (
                <CardFooter className="flex flex-col items-start gap-2 border-t pt-4">
                  <p className="text-xs text-muted-foreground">وصف العمل</p>
                  <p className="text-sm">{userData.business_account?.business_description}</p>
                </CardFooter>
              )}
            </Card>
          )}
        </div>
      ) : (
        !isLoading &&
        !error && (
          <Card className="shadow-sm border-border/50">
            <CardContent className="py-16 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-muted-foreground font-medium">لم يتم اختيار مستخدم</p>
              <p className="text-sm text-muted-foreground">ابحث عن مستخدم باستخدام ID أو البريد الإلكتروني</p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
};
