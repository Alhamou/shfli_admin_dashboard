import { ICreatMainItem } from "@/interfaces";
import { formatPrice, getPriceDiscount } from "@/lib/helpFunctions";
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  Globe,
  Heart,
  Mail,
  MapPin,
  Package,
  Percent,
  Phone,
  Tag,
  Truck,
  User
} from "lucide-react";
import moment from "moment";
import { Dispatch, SetStateAction } from "react";
import { EditableField } from "./EditableField";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Separator } from "./ui/separator";

interface InfoFieldProps {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  className?: string;
}

const InfoField = ({ icon, label, value, className = "" }: InfoFieldProps) => (
  <div className={`flex items-start gap-3 ${className}`}>
    {icon && (
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
        {icon}
      </div>
    )}
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
      <div className="text-sm font-medium">{value || "غير متوفر"}</div>
    </div>
  </div>
);

const SectionHeader = ({ title, icon }: { title: string; icon: React.ReactNode }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
      {icon}
    </div>
    <h3 className="font-semibold text-base">{title}</h3>
  </div>
);

export const ViewItemMiddleColumn = ({
  item,
  isEditing,
  editedFields,
  originalItem,
  setEditedFields,
  setItem,
}: {
  item: ICreatMainItem;
  isEditing: boolean;
  editedFields: Partial<ICreatMainItem>;
  originalItem: ICreatMainItem | null;
  setEditedFields: Dispatch<SetStateAction<Partial<ICreatMainItem>>>;
  setItem: Dispatch<SetStateAction<ICreatMainItem | null>>;
}) => {
  const activated_at = moment(item?.activated_at).locale("ar").fromNow();
  const updated_at = item.updated_at ? moment(item.updated_at).locale("ar").fromNow() : null;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "blocked": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "نشط";
      case "blocked": return "محظور";
      case "pending": return "معلق";
      default: return status;
    }
  };

  return (
    <div className="flex-grow px-4 space-y-4" style={{ direction: "rtl" }}>

      {/* Header Section - Title & Status */}
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-0 space-y-3">
          {/* Title */}
          <EditableField
            label=""
            value={item.title}
            fieldName="title"
            editedFields={editedFields}
            isEditing={isEditing}
            item={item}
            originalItem={originalItem}
            setEditedFields={setEditedFields}
            setItem={setItem}
            className="text-xl font-bold"
          />

          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={getStatusVariant(item.is_active)} className="text-sm">
              {getStatusLabel(item.is_active)}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {item.item_as === "job" ? "وظيفة" : item.item_as === "shop" ? "متجر" : "مستعمل"}
            </Badge>
            {item.item_for && (
              <Badge variant="secondary" className="text-sm">
                {item.item_for === "sale" ? "للبيع" : item.item_for === "rent" ? "للإيجار" : item.item_for === "bid" ? "مزاد" : item.item_for}
              </Badge>
            )}
            <Badge variant="outline" className="text-sm">
              {item.account_type === "business" ? "حساب تجاري" : "حساب فردي"}
            </Badge>
            {item.client_details?.account_verified && (
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-sm">
                موثق
              </Badge>
            )}
            {item.reserved && (
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-sm">
                محجوز
              </Badge>
            )}
            {item.archived && (
              <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-0 text-sm">
                مؤرشف
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Price Section - Most Important for non-job items */}
      {item.item_as !== "job" && item.price && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">السعر</p>
                  <div className="flex items-baseline gap-2">
                    <EditableField
                      label=""
                      value={item.price}
                      fieldName="price"
                      type="number"
                      editedFields={editedFields}
                      isEditing={isEditing}
                      item={item}
                      originalItem={originalItem}
                      setEditedFields={setEditedFields}
                      setItem={setItem}
                      className="text-2xl font-bold text-primary"
                    />
                    {item.discount > 0 && !isEditing && (
                      <span className="text-sm line-through text-muted-foreground">
                        {formatPrice(item.price, item?.currency)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {item.discount > 0 && (
                <Badge className="bg-emerald-500 text-white text-base px-3 py-1">
                  <Percent className="h-4 w-4 ml-1" />
                  {item.discount}% خصم
                </Badge>
              )}
            </div>
            {item.obo && (
              <p className="text-xs text-muted-foreground mt-2">* السعر قابل للتفاوض</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Description Section */}
      <Card>
        <CardContent className="p-4">
          <SectionHeader title="الوصف" icon={<Package className="h-4 w-4 text-primary" />} />
          <EditableField
            label=""
            value={item.description}
            fieldName="description"
            isTextarea
            editedFields={editedFields}
            isEditing={isEditing}
            item={item}
            originalItem={originalItem}
            setEditedFields={setEditedFields}
            setItem={setItem}
          />
          {item.ai_description && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">وصف الذكاء الاصطناعي</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">{item.ai_description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category & Location - Key Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Card */}
        <Card>
          <CardContent className="p-4">
            <SectionHeader title="التصنيف" icon={<Tag className="h-4 w-4 text-primary" />} />
            <div className="space-y-3">
              <InfoField
                label="الفئة"
                value={
                  <div>
                    <span>{item.category_name?.ar || "غير متوفر"}</span>
                    <span className="text-xs text-muted-foreground mr-2">(ID: {item.category_id})</span>
                  </div>
                }
              />
              <InfoField
                label="الفئة الفرعية"
                value={
                  <div>
                    <span>{item.subcategory_name?.ar || "غير متوفر"}</span>
                    <span className="text-xs text-muted-foreground mr-2">(ID: {item.subcategory_id})</span>
                  </div>
                }
              />
              {item.model_name && (
                <InfoField
                  label="الموديل"
                  value={item.model_name.ar}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location Card */}
        <Card>
          <CardContent className="p-4">
            <SectionHeader title="الموقع" icon={<MapPin className="h-4 w-4 text-primary" />} />
            <div className="space-y-4">
              <EditableField
                label="العنوان"
                value={item.address}
                fieldName="address"
                editedFields={editedFields}
                isEditing={isEditing}
                item={item}
                originalItem={originalItem}
                setEditedFields={setEditedFields}
                setItem={setItem}
                className="font-bold"
              />
              <div className="grid grid-cols-2 gap-4">
                <EditableField
                  label="المدينة"
                  value={item.city}
                  fieldName="city"
                  editedFields={editedFields}
                  isEditing={isEditing}
                  item={item}
                  originalItem={originalItem}
                  setEditedFields={setEditedFields}
                  setItem={setItem}
                  className="font-bold"
                />
                <EditableField
                  label="المنطقة"
                  value={item.state}
                  fieldName="state"
                  editedFields={editedFields}
                  isEditing={isEditing}
                  item={item}
                  originalItem={originalItem}
                  setEditedFields={setEditedFields}
                  setItem={setItem}
                  className="font-bold"
                />
              </div>
              {item.latitude && item.longitude && (
                <div className="pt-2 border-t border-border/80">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">الإحداثيات الجغرافية</p>
                  <code className="text-[10px] font-mono bg-muted px-2 py-1 rounded" style={{ direction: 'ltr' }}>
                    {item.latitude}, {item.longitude}
                  </code>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Contact Card */}
        <Card>
          <CardContent className="p-4">
            <SectionHeader title="التواصل" icon={<Phone className="h-4 w-4 text-primary" />} />
            <div className="space-y-3">
              <div className="flex-1">
                <EditableField
                  label="واتساب"
                  value={item.contact_whatsapp}
                  fieldName="contact_whatsapp"
                  editedFields={editedFields}
                  isEditing={isEditing}
                  item={item}
                  originalItem={originalItem}
                  setEditedFields={setEditedFields}
                  setItem={setItem}
                  className="font-bold underline tabular-nums"
                />
              </div>
              {item.item_as !== "job" && (
                <div className="flex-1">
                  <EditableField
                    label="الهاتف"
                    value={item.contact_phone}
                    fieldName="contact_phone"
                    editedFields={editedFields}
                    isEditing={isEditing}
                    item={item}
                    originalItem={originalItem}
                    setEditedFields={setEditedFields}
                    setItem={setItem}
                    className="font-bold underline tabular-nums"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardContent className="p-4">
            <SectionHeader title="الإحصائيات" icon={<Eye className="h-4 w-4 text-primary" />} />
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Eye className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-bold">{item.view_count || 0}</p>
                <p className="text-xs text-muted-foreground">مشاهدة</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Heart className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-bold">{item.favorite_at ? 1 : 0}</p>
                <p className="text-xs text-muted-foreground">مفضلة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date & Time Information */}
      <Card>
        <CardContent className="p-4">
          <SectionHeader title="التواريخ" icon={<Calendar className="h-4 w-4 text-primary" />} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoField
              icon={<Clock className="h-4 w-4 text-primary" />}
              label="تاريخ النشر"
              value={activated_at.replace(/^منذ\s*/, "")}
            />
            {updated_at && (
              <InfoField
                icon={<Clock className="h-4 w-4 text-primary" />}
                label="آخر تحديث"
                value={updated_at}
              />
            )}
            {item.deleted_at && (
              <InfoField
                icon={<Clock className="h-4 w-4 text-destructive" />}
                label="تاريخ الحذف"
                value={moment(item.deleted_at).locale("ar").fromNow()}
              />
            )}
            {item.date_end_discount && (
              <InfoField
                icon={<Clock className="h-4 w-4 text-amber-500" />}
                label="انتهاء الخصم"
                value={new Date(item.date_end_discount).toLocaleDateString("ar")}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Options - Delivery, Installment, Negotiable */}
      {item.item_as !== "job" && (
        <Card>
          <CardContent className="p-4">
            <SectionHeader title="الخيارات" icon={<Truck className="h-4 w-4 text-primary" />} />
            <div className="flex flex-wrap gap-3">
              <Badge variant={item.delivery_available ? "default" : "secondary"} className="text-sm py-1.5 px-3">
                <Truck className="h-4 w-4 ml-1" />
                التوصيل: {item.delivery_available ? "متاح" : "غير متاح"}
              </Badge>
              <Badge variant={item.installment ? "default" : "secondary"} className="text-sm py-1.5 px-3">
                <CreditCard className="h-4 w-4 ml-1" />
                التقسيط: {item.installment ? "متاح" : "غير متاح"}
              </Badge>
              <Badge variant={item.obo ? "default" : "secondary"} className="text-sm py-1.5 px-3">
                <DollarSign className="h-4 w-4 ml-1" />
                التفاوض: {item.obo ? "متاح" : "غير متاح"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job-specific Section */}
      {item.item_as === "job" && (
        <Card>
          <CardContent className="p-4">
            <SectionHeader title="تفاصيل الوظيفة" icon={<Briefcase className="h-4 w-4 text-primary" />} />
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoField
                  label="نوع الإعلان"
                  value={
                    <Badge variant={item.need ? "default" : "secondary"}>
                      {item.need ? "باحث عن عمل" : "باحث عن موظف"}
                    </Badge>
                  }
                />
                <InfoField
                  label="عمل عن بعد"
                  value={
                    <Badge variant={item.remote_job ? "default" : "outline"}>
                      {item.remote_job ? "نعم" : "لا"}
                    </Badge>
                  }
                />
                <InfoField
                  label="الحالة"
                  value={
                    <Badge variant={item.ended ? "secondary" : "default"}>
                      {item.ended ? "منتهي" : "نشط"}
                    </Badge>
                  }
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {item.company_name && (
                  <InfoField
                    icon={<Building2 className="h-4 w-4 text-primary" />}
                    label="اسم الشركة"
                    value={item.company_name}
                  />
                )}
                {item.company_website && (
                  <InfoField
                    icon={<Globe className="h-4 w-4 text-primary" />}
                    label="موقع الشركة"
                    value={
                      <a href={item.company_website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {item.company_website}
                      </a>
                    }
                  />
                )}
                {item.contact_phone && (
                  <InfoField
                    icon={<Phone className="h-4 w-4 text-primary" />}
                    label="هاتف الشركة"
                    value={<span style={{ direction: "ltr" }}>{item.contact_phone}</span>}
                  />
                )}
                {item.contact_email && (
                  <InfoField
                    icon={<Mail className="h-4 w-4 text-primary" />}
                    label="البريد الإلكتروني"
                    value={item.contact_email}
                  />
                )}
              </div>

              {(item.job_type || item.experience_level || item.education_level) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {item.job_type && (
                      <InfoField label="نوع الوظيفة" value={item.job_type} />
                    )}
                    {item.experience_level && (
                      <InfoField label="مستوى الخبرة" value={item.experience_level} />
                    )}
                    {item.education_level && (
                      <InfoField label="المستوى التعليمي" value={item.education_level} />
                    )}
                  </div>
                </>
              )}

              {item.skills_required && (
                <>
                  <Separator />
                  <InfoField label="المهارات المطلوبة" value={item.skills_required} />
                </>
              )}

              {item.benefits && (
                <InfoField label="المميزات" value={item.benefits} />
              )}

              {item.application_deadline && (
                <InfoField
                  label="آخر موعد للتقديم"
                  value={new Date(item.application_deadline).toLocaleDateString("ar")}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Specifications - for shop/used items */}
      {item.item_as !== "job" && (item.storage_capacity || item.ram || item.mileage || item.area || item.bedrooms) && (
        <Card>
          <CardContent className="p-4">
            <SectionHeader title="المواصفات" icon={<Package className="h-4 w-4 text-primary" />} />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Mobile specs */}
              {item.storage_capacity && (
                <InfoField label="مساحة التخزين" value={`${item.storage_capacity} GB`} />
              )}
              {item.ram && (
                <InfoField label="الرام" value={`${item.ram} GB`} />
              )}
              {item.operating_system && (
                <InfoField label="نظام التشغيل" value={item.operating_system} />
              )}
              {item.screen_size && (
                <InfoField label="حجم الشاشة" value={`${item.screen_size}"`} />
              )}
              {item.battery_capacity && (
                <InfoField label="البطارية" value={`${item.battery_capacity} mAh`} />
              )}
              {item.camera_resolution && (
                <InfoField label="الكاميرا" value={item.camera_resolution} />
              )}
              {item.color && (
                <InfoField label="اللون" value={item.color} />
              )}
              {item.condition && (
                <InfoField label="الحالة" value={item.condition} />
              )}
              {item.network_type && (
                <InfoField label="نوع الشبكة" value={item.network_type} />
              )}

              {/* Car specs */}
              {item.mileage && (
                <InfoField label="المسافة المقطوعة" value={`${item.mileage} km`} />
              )}
              {item.transmission_type && (
                <InfoField label="ناقل الحركة" value={item.transmission_type} />
              )}
              {item.year && (
                <InfoField label="السنة" value={item.year} />
              )}
              {item.fuel_type_id && (
                <InfoField label="نوع الوقود" value={`ID: ${item.fuel_type_id}`} />
              )}
              {item.series && (
                <InfoField label="الفئة" value={item.series} />
              )}

              {/* Property specs */}
              {item.area && (
                <InfoField label="المساحة" value={`${item.area} م²`} />
              )}
              {item.bedrooms && (
                <InfoField label="غرف النوم" value={item.bedrooms} />
              )}
              {item.bathrooms && (
                <InfoField label="الحمامات" value={item.bathrooms} />
              )}
              {item.floor && (
                <InfoField label="الطابق" value={item.floor} />
              )}
              {item.year_built && (
                <InfoField label="سنة البناء" value={item.year_built} />
              )}
              {item.is_furnished !== undefined && (
                <InfoField label="مفروش" value={item.is_furnished ? "نعم" : "لا"} />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User & Item IDs - Technical Info */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <SectionHeader title="معلومات تقنية" icon={<User className="h-4 w-4 text-primary" />} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Info */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">المستخدم</h4>
              <div className="p-3 bg-background rounded-lg space-y-1 text-sm">
                <p><span className="text-muted-foreground">ID:</span> {item.user_id}</p>
                <p className="truncate" style={{ direction: "ltr" }}>
                  <span className="text-muted-foreground" style={{ direction: "rtl" }}>UUID:</span> {item.client_details?.uuid || item.uuid_client}
                </p>
                <p><span className="text-muted-foreground">الاسم:</span> {(item.client_details?.first_name ?? "") + " " + (item.client_details?.last_name ?? "")}</p>
                <p style={{ direction: "ltr" }}><span className="text-muted-foreground" style={{ direction: "rtl" }}>الهاتف:</span> {item.client_details?.phone_number}</p>
                {item.client_details?.account_type === "business" && item.client_details?.business_name && (
                  <p><span className="text-muted-foreground">النشاط التجاري:</span> {item.client_details.business_name}</p>
                )}
              </div>
            </div>

            {/* Item Info */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">المنشور</h4>
              <div className="p-3 bg-background rounded-lg space-y-1 text-sm">
                <p><span className="text-muted-foreground">ID:</span> {item.id}</p>
                <p><span className="text-muted-foreground">Main ID:</span> {item.main_items_id}</p>
                <p className="truncate" style={{ direction: "ltr" }}>
                  <span className="text-muted-foreground" style={{ direction: "rtl" }}>UUID:</span> {item.uuid}
                </p>
                {item.position !== undefined && (
                  <p><span className="text-muted-foreground">الموضع:</span> {item.position}</p>
                )}
              </div>
            </div>
          </div>

          {/* Status Notes */}
          {item.status_note && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">ملاحظة الحالة</p>
              <p className="text-sm">{item.status_note}</p>
            </div>
          )}

          {/* Filtered content */}
          {(item.title_filtered || item.description_filtered) && (
            <div className="mt-4 space-y-2">
              {item.title_filtered && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">العنوان المصفى</p>
                  <p className="text-sm">{item.title_filtered}</p>
                </div>
              )}
              {item.description_filtered && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">الوصف المصفى</p>
                  <p className="text-sm">{item.description_filtered}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
