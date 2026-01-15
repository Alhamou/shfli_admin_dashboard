import { SendNotificationPopup } from "@/components/SendNotificationPopup";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { AlertCircle, Edit, MessageCircle, Save, X, XIcon } from "lucide-react";
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
      <Badge variant="outline" className="bg-blue-100 text-blue-800">
        فرد
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-purple-100 text-purple-800">
        عمل
      </Badge>
    );
  };

  return (
    <div
      className="mx-auto p-4"
      style={{ direction: "rtl" }}
    >
      <div className="flex flex-row">
        <h1 className="text-2xl font-bold mb-6">معلومات المستخدم</h1>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="أدخل معرف المستخدم أو البريد الإلكتروني"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              setError(null);
            }}
            className="flex-1"
            style={{ direction: "ltr" }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 -top-[-5px] h-7 w-7 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            onClick={() => {
              setUserId("");
            }}
          >
            <XIcon className="h-4 w-4" color="red" />
            <span className="sr-only">Clear</span>
          </Button>
        </div>
        <Button onClick={handleFetchUser} disabled={isLoading}>
          {isLoading ? "جاري التحميل..." : "الحصول على المستخدم"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {userData ? (
        <div className="lg:flex lg:flex-row flex flex-col w-full gap-4">
          {/* User Information Card */}
          <Card className="flex-grow mb-4">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  {userData.image && (
                    <img
                      src={userData.image}
                      alt="User"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Input
                          defaultValue={userData.first_name || ""}
                          onChange={(e) =>
                            handleInputChange("first_name", e.target.value)
                          }
                           placeholder="الاسم"
                          className="w-32"
                        />
                        <Input
                          defaultValue={userData.last_name || ""}
                          onChange={(e) =>
                            handleInputChange("last_name", e.target.value)
                          }
                           placeholder="الكنية"
                          className="w-32"
                        />
                      </div>
                    ) : (
                      <h2 className="text-xl font-semibold">
                        {userData.first_name ?? ""} {userData.last_name ?? ""}
                      </h2>
                    )}
                    <div className="flex gap-2 mt-1">
                      {getAccountTypeBadge(userData.account_type)}
                      {userData.blocked && (
                        <Badge variant="destructive">
                          محظور
                        </Badge>
                      )}
                      {userData.account_verified && (
                        <CustomBadge variant="active">
                          موثق
                        </CustomBadge>
                      )}
                      {userData.deleted_at && (
                        <Badge variant="destructive">
                          محذوف
                        </Badge>
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
                      >
                        <Edit className="h-4 w-4 mr-2" />
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
                            toast.success(
                              "تم إرسال الإشعار بنجاح"
                            );
                          } catch {
                            toast.error(
                              "فشل إرسال الإشعار"
                            );
                          } finally {
                            setLoadingNotification(false);
                          }
                        }}
                      >
                        <Button
                          variant="outline"
                          className="flex-1 lg:flex-none"
                        >
                          <MessageCircle /> إرسال إشعار
                        </Button>
                      </SendNotificationPopup>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        إلغاء
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveChanges}
                        disabled={isLoading}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        حفظ
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">المعلومات الأساسية</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      البريد الإلكتروني
                    </p>
                    <p>{userData.email || "غير متوفر"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      رقم الهاتف
                    </p>
                    {isEditing ? (
                      <Input
                        defaultValue={userData.phone_number || ""}
                        onChange={(e) =>
                          handleInputChange("phone_number", e.target.value)
                        }
                        dir="ltr"
                      />
                    ) : (
                      <p
                        style={{
                          direction: "ltr",
                          textAlign: "right",
                        }}
                      >
                        {userData.phone_number || "غير متوفر"}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      تاريخ الميلاد
                    </p>
                    <p>{formatDate(userData.birth_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      تاريخ الإنشاء
                    </p>
                    <p>{formatDate(userData.created_at)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">حالة الحساب</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      موثق
                    </p>
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="account-verified"
                          checked={
                            editData.account_verified ??
                            userData.account_verified ??
                            false
                          }
                          onCheckedChange={(checked) =>
                            handleInputChange("account_verified", checked)
                          }
                          style={{ direction: "ltr" }}
                        />
                        <Label htmlFor="account-verified">
                          {formatBoolean(
                            editData.account_verified ??
                              userData.account_verified
                          )}
                        </Label>
                      </div>
                    ) : (
                      <p>{formatBoolean(userData.account_verified)}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      الهاتف موثق
                    </p>
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="phone-verified"
                          checked={
                            editData.phone_verified ??
                            userData.phone_verified ??
                            false
                          }
                          onCheckedChange={(checked) =>
                            handleInputChange("phone_verified", checked)
                          }
                          style={{ direction: "ltr" }}
                        />
                        <Label htmlFor="phone-verified">
                          {formatBoolean(
                            editData.phone_verified ?? userData.phone_verified
                          )}
                        </Label>
                      </div>
                    ) : (
                      <p>{formatBoolean(userData.phone_verified)}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      محظور
                    </p>
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="blocked"
                          checked={
                            editData.blocked ?? userData.blocked ?? false
                          }
                          onCheckedChange={(checked) =>
                            handleInputChange("blocked", checked)
                          }
                          style={{ direction: "ltr" }}
                        />
                        <Label htmlFor="blocked">
                          {formatBoolean(editData.blocked ?? userData.blocked)}
                        </Label>
                      </div>
                    ) : (
                      <p>{formatBoolean(userData.blocked)}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      محذوف
                    </p>
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="deleted"
                          checked={
                            !!(editData.deleted_at ?? userData.deleted_at)
                          }
                          onCheckedChange={(checked) => {
                            handleInputChange(
                              "deleted_at",
                              checked ? new Date().getTime() : null
                            );
                          }}
                          style={{ direction: "ltr" }}
                        />
                        <Label htmlFor="deleted">
                          {formatBoolean(
                            !!(editData.deleted_at ?? userData.deleted_at)
                          )}
                        </Label>
                      </div>
                    ) : (
                      <p>
                        {userData.deleted_at
                          ? `نعم (${formatDate(
                              userData.deleted_at
                            )})`
                          : "لا"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">معلومات إضافية</h3>
                <div>
                  <p className="text-sm text-muted-foreground">
                    الأدوار
                  </p>
                  <div className="flex gap-1 flex-wrap">
                    {userData.roles.length > 0 ? (
                      userData.roles.map((role) => (
                        <Badge key={role} variant="secondary">
                          {role}
                        </Badge>
                      ))
                    ) : (
                      <p>غير متوفر</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    معلومات الاتصال
                  </p>
                  {isEditing ? (
                    <Textarea
                      defaultValue={userData.contact_data || ""}
                      onChange={(e) =>
                        handleInputChange("contact_data", e.target.value)
                      }
                      className="min-w-[500px]"
                    />
                  ) : (
                    <p>{userData.contact_data || "غير متوفر"}</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              {userData.id} <br />
              {userData.uuid}
            </CardFooter>
          </Card>

          {/* Business Information Card (only shown for business accounts) */}
          {userData.account_type === "business" && (
            <Card className="flex-grow mt-0">
              <CardHeader>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  معلومات العمل
                  {userData.business_account?.business_name && (
                    <span className="text-muted-foreground">
                      - {userData.business_account?.business_name}
                    </span>
                  )}
                </h2>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      نوع العمل
                    </p>
                    <p>
                      {userData.business_account?.business_type?.ar || "غير متوفر"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      البريد الإلكتروني للعمل
                    </p>
                    <p>
                      {userData.business_account?.business_email ||
                        "غير متوفر"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      هاتف العمل
                    </p>
                    <p
                      style={{
                        direction: "ltr",
                        textAlign: "right",
                      }}
                    >
                      {userData.business_account?.business_phone_number ||
                        "غير متوفر"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      الرقم الضريبي
                    </p>
                    <p>
                      {userData.business_account?.tax_number ||
                        "غير متوفر"}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      عنوان العمل
                    </p>
                    <p>
                      {userData.business_account?.business_address ||
                        "غير متوفر"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      رابط الموقع
                    </p>
                    <p>
                      {userData.business_account?.website_url ? (
                        <a
                          href={userData.business_account?.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {userData.business_account?.website_url}
                        </a>
                      ) : (
                        "غير متوفر"
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
              {userData.business_account?.business_description && (
                <CardFooter className="flex flex-col items-start gap-2">
                  <p className="text-sm text-muted-foreground">
                    وصف العمل
                  </p>
                  <p className="text-sm">
                    {userData.business_account?.business_description}
                  </p>
                </CardFooter>
              )}
            </Card>
          )}
        </div>
      ) : (
        !isLoading &&
        !error && (
          <div className="text-center py-8 text-muted-foreground">
            لم يتم اختيار مستخدم
          </div>
        )
      )}
    </div>
  );
};
