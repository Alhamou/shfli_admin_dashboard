import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { getUserInfo, putUserInfo } from "@/services/restApiServices";
import { IUser } from "@/interfaces";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Edit, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomBadge } from "@/components/ui/custom-badge";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const UserInfo = () => {
  const { t, i18n } = useTranslation();
  const [userId, setUserId] = useState("");
  const [userData, setUserData] = useState<IUser | null>(null);
  const [editData, setEditData] = useState<Partial<IUser>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleFetchUser = async () => {
    if (!userId.trim()) {
      setError(t("errors.emptyUserID"));
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
      setError(t("errors.invalidUserID"));
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
      const updatedUser = await putUserInfo({ ...editData, id: userData.id });
      handleFetchUser();
      setEditData({});
      setIsEditing(false);
      toast.success(t("userInfo.updateSuccess"));
    } catch (error) {
      toast.error(t("errors.updateFailed"));
      console.error("Error updating user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return t("userInfo.notAvailable");
    return new Date(date).toLocaleDateString();
  };

  const formatBoolean = (value: boolean | null) => {
    if (value === null) return t("userInfo.notAvailable");
    return value ? t("userInfo.yes") : t("userInfo.no");
  };

  const getAccountTypeBadge = (type: "individual" | "business") => {
    return type === "individual" ? (
      <Badge variant="outline" className="bg-blue-100 text-blue-800">
        {t("userInfo.individual")}
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-purple-100 text-purple-800">
        {t("userInfo.business")}
      </Badge>
    );
  };

  return (
    <div
      className="mx-auto p-4"
      style={{ direction: i18n.language === "ar" ? "rtl" : "ltr" }}
    >
      <h1 className="text-2xl font-bold mb-6">{t("userInfo.title")}</h1>

      <div className="flex gap-2 mb-6">
        <Input
          type="text"
          placeholder={t("userInfo.userIdPlaceholder")}
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value);
            setError(null);
          }}
          className="flex-1"
          style={{ direction: "ltr" }}
        />
        <Button onClick={handleFetchUser} disabled={isLoading}>
          {isLoading ? t("userInfo.loading") : t("userInfo.getUser")}
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
                    <h2 className="text-xl font-semibold">
                      {userData.first_name ?? ""} {userData.last_name ?? ""}
                    </h2>
                    <div className="flex gap-2 mt-1">
                      {getAccountTypeBadge(userData.account_type)}
                      {userData.blocked && (
                        <Badge variant="destructive">
                          {t("userInfo.blocked")}
                        </Badge>
                      )}
                      {userData.account_verified && (
                        <CustomBadge variant="active">
                          {t("userInfo.verified")}
                        </CustomBadge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {t("userInfo.edit")}
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        {t("userInfo.cancel")}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveChanges}
                        disabled={isLoading}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {t("userInfo.save")}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">{t("userInfo.basicInfo")}</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("userInfo.email")}
                    </p>
                    <p>{userData.email || t("userInfo.notAvailable")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("userInfo.phone")}
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
                          textAlign: i18n.language === "ar" ? "right" : "left",
                        }}
                      >
                        {userData.phone_number || t("userInfo.notAvailable")}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("userInfo.birthDate")}
                    </p>
                    <p>{formatDate(userData.birth_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("userInfo.createdAt")}
                    </p>
                    <p>{formatDate(userData.created_at)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">{t("userInfo.accountStatus")}</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("userInfo.verified")}
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
                      {t("userInfo.phoneVerified")}
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
                      {t("userInfo.blocked")}
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
                      {t("userInfo.deleted")}
                    </p>
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="deleted"
                          checked={
editData.deleted ?? userData.deleted 
                          }
                          onCheckedChange={(checked) =>
                            handleInputChange(
                              "deleted",
                              checked
                            )
                          }
                          style={{ direction: "ltr" }}
                        />
                        <Label htmlFor="deleted">
                          {formatBoolean(
editData.deleted ?? userData.deleted 
                          )}
                        </Label>
                      </div>
                    ) : (
                      <p>
                        {userData.deleted
                          ? t("userInfo.yes")
                          : t("userInfo.no")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">{t("userInfo.additionalInfo")}</h3>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("userInfo.roles")}
                  </p>
                  <div className="flex gap-1 flex-wrap">
                    {userData.roles.length > 0 ? (
                      userData.roles.map((role) => (
                        <Badge key={role} variant="secondary">
                          {role}
                        </Badge>
                      ))
                    ) : (
                      <p>{t("userInfo.notAvailable")}</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("userInfo.contactData")}
                  </p>
                  <p>{userData.contact_data || t("userInfo.notAvailable")}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              {t("userInfo.userId")}: {userData.id} | <br /> UUID:{" "}
              {userData.uuid}
            </CardFooter>
          </Card>

          {/* Business Information Card (only shown for business accounts) */}
          {userData.account_type === "business" && (
            <Card className="flex-grow mt-0">
              <CardHeader>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {t("userInfo.businessInfo")}
                  {userData.business_name && (
                    <span className="text-muted-foreground">
                      - {userData.business_name}
                    </span>
                  )}
                </h2>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("userInfo.businessType")}
                    </p>
                    <p>
                      {userData.business_type?.[i18n.language as "ar" | "en"] ||
                        t("userInfo.notAvailable")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("userInfo.businessEmail")}
                    </p>
                    <p>
                      {userData.business_email || t("userInfo.notAvailable")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("userInfo.businessPhone")}
                    </p>
                    <p
                      style={{
                        direction: "ltr",
                        textAlign: i18n.language === "ar" ? "right" : "left",
                      }}
                    >
                      {userData.business_phone_number ||
                        t("userInfo.notAvailable")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("userInfo.taxNumber")}
                    </p>
                    <p>{userData.tax_number || t("userInfo.notAvailable")}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("userInfo.businessAddress")}
                    </p>
                    <p>
                      {userData.business_address || t("userInfo.notAvailable")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("userInfo.websiteUrl")}
                    </p>
                    <p>
                      {userData.website_url ? (
                        <a
                          href={userData.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {userData.website_url}
                        </a>
                      ) : (
                        t("userInfo.notAvailable")
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
              {userData.business_description && (
                <CardFooter className="flex flex-col items-start gap-2">
                  <p className="text-sm text-muted-foreground">
                    {t("userInfo.businessDescription")}
                  </p>
                  <p className="text-sm">{userData.business_description}</p>
                </CardFooter>
              )}
            </Card>
          )}
        </div>
      ) : (
        !isLoading &&
        !error && (
          <div className="text-center py-8 text-muted-foreground">
            {t("userInfo.noUserSelected")}
          </div>
        )
      )}
    </div>
  );
};
