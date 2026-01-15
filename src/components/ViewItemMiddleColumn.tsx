import { ICreatMainItem } from "@/interfaces";
import moment from "moment";
import { Dispatch, SetStateAction } from "react";
import { EditableField } from "./EditableField";
import { Badge } from "./ui/badge";

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
  const activated_at = moment(item?.activated_at)
    .locale("ar")
    .fromNow();

  return (
    <div
      className="flex-grow px-4"
      style={{ direction: "rtl" }}
    >
      <div className="my-4">
        <EditableField
          label="العنوان"
          value={item.title}
          fieldName="title"
          editedFields={editedFields}
          isEditing={isEditing}
          item={item}
          originalItem={originalItem}
          setEditedFields={setEditedFields}
          setItem={setItem}
        />
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{item.item_as}</Badge>
          {item.item_for && <Badge variant="secondary">{item.item_for}</Badge>}
          <Badge
            variant={
              item.is_active === "active"
                ? "default"
                : item.is_active === "blocked"
                ? "destructive"
                : "secondary"
            }
          >
            {item.is_active}
          </Badge>
          <Badge variant="outline">
            {item.account_type === "business"
              ? "تجاري"
              : "فردي"}
          </Badge>
          {item.section && (
            <Badge variant="outline">Section {item.section}</Badge>
          )}
        </div>
      </div>

      <div className="my-4">
        <EditableField
          label="الوصف"
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
          <div className="mt-2">
            <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
              وصف الذكاء الاصطناعي
            </p>
            <p className="text-sm">{item.ai_description}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-8">
        {/* Position and Basic Info */}
        <EditableField
          label="الموقع"
          value={item.position?.toString() || ""}
          fieldName="position"
          type="number"
          editedFields={editedFields}
          isEditing={isEditing}
          item={item}
          originalItem={originalItem}
          setEditedFields={setEditedFields}
          setItem={setItem}
        />

        <div>
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            الفئة
          </p>
          <p className="text-sm">
            {item.category_name?.ar || "غير متوفر"}
          </p>
          <p className="text-xs text-muted-foreground">
            ID: {item.category_id}
          </p>
        </div>

        <div>
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            الفئة الفرعية
          </p>
          <p className="text-sm">
            {item.subcategory_name?.ar || "غير متوفر"}
          </p>
          <p className="text-xs text-muted-foreground">
            ID: {item.subcategory_id}
          </p>
        </div>

        {item.model_name && (
          <div className="col-span-2">
            <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
              الموديل
            </p>
            <p className="text-sm">
              {item.model_name.ar || "غير متوفر"}
            </p>
            {item.category_model_id && (
              <p className="text-xs text-muted-foreground">
                ID: {item.category_model_id}
              </p>
            )}
          </div>
        )}

        {/* Location Information */}

        <div>
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            العنوان
          </p>
          <p className="text-sm">{item.address}</p>
          <p className="text-xs text-muted-foreground">
            Coordinates: {item.latitude}, {item.longitude}
          </p>
        </div>
        <div>
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            المدينة
          </p>
          <p className="text-sm">{item.city}</p>
          <p className="text-xs text-muted-foreground">
            Location ID: {item.location_id}
          </p>
        </div>
        <div>
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            المنطقة
          </p>
          <p className="text-sm">{item.state}</p>
        </div>

        {/* Contact Information */}
        <div>
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            واتساب التواصل
          </p>
          <p className="text-sm" style={{ direction: "ltr" }}>
            {item.contact_whatsapp || "غير متوفر"}
          </p>
        </div>
        {item.item_as !== "job" && (
          <div>
            <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
              الهاتف
            </p>
            <p className="text-sm">
              {item.contact_phone || "غير متوفر"}
            </p>
          </div>
        )}

        {/* Stats */}
        <div>
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            المشاهدات
          </p>
          <p className="text-sm">{item.view_count || 0}</p>
        </div>
        <div>
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            المفضلة
          </p>
          <p className="text-sm">{item.favorite_at ? 1 : 0}</p>
        </div>
        {/* <div>
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            {t("dialog.labels.reviews")}
          </p>
          <p className="text-sm">
            {item.review_count || 0} ({item.average_rating || 0}★)
          </p>
        </div> */}
        <div className="col-span-2">
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            تاريخ الإنشاء
          </p>
          <p className="text-sm">
            {activated_at.replace(/^منذ\s*/, "").replace(/\s*ago$/, "")}
          </p>
          {item.updated_at && (
            <p className="text-xs text-muted-foreground">
              تاريخ التحديث: {moment(item.updated_at).locale("ar").fromNow()}
            </p>
          )}
          {item.deleted_at && (
            <p className="text-xs text-destructive">
              تاريخ الحذف: {moment(item.deleted_at).locale("ar").fromNow()}
            </p>
          )}
        </div>

        {/* Delivery and Purchase Options */}
        <div>
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            التوصيل متاح
          </p>
          <p className="text-sm">
            {item.delivery_available
              ? "نعم"
              : "لا"}
          </p>
        </div>
        <div>
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            التقسيط متاح
          </p>
          <p className="text-sm">
            {item.installment
              ? "نعم"
              : "لا"}
          </p>
        </div>
        <div>
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            قابل للتفاوض
          </p>
          <p className="text-sm">
            {item.obo ? "نعم" : "لا"}
          </p>
        </div>

        {/* Job-specific details or item details */}
        {item.item_as === "job" ? (
          <>
            <div className="col-span-2">
              <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                نوع الوظيفة
              </p>
              {isEditing ? (
                <div className="flex flex-col">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="need"
                      checked={item.need === true}
                      onChange={() => {
                        setItem({ ...item, need: true });
                        setEditedFields({
                          ...editedFields,
                          need: true,
                        });
                      }}
                      className="h-4 w-4"
                    />
                    باحث عن عمل
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="need"
                      checked={item.need === false}
                      onChange={() => {
                        setItem({ ...item, need: false });
                        setEditedFields({
                          ...editedFields,
                          need: false,
                        });
                      }}
                      className="h-4 w-4"
                    />
                    باحث عن موظف
                  </label>
                </div>
              ) : (
                <p className="text-sm">
                  {item.need
                    ? "باحث عن عمل"
                    : "باحث عن موظف"}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                عمل عن بعد
              </p>
              <p className="text-sm">
                {item.remote_job
                  ? "نعم"
                  : "لا"}
              </p>
            </div>
            <div>
              <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                انتهاء التوظيف
              </p>
              <p className="text-sm">
                {item.ended
                  ? "نعم"
                  : "لا"}
              </p>
            </div>
            <div className="col-span-2">
              <EditableField
                label="اسم الشركة"
                value={item.company_name}
                fieldName="company_name"
                editedFields={editedFields}
                isEditing={isEditing}
                item={item}
                originalItem={originalItem}
                setEditedFields={setEditedFields}
                setItem={setItem}
              />
            </div>
            <div>
              <EditableField
                label="موقع الشركة الإلكتروني"
                value={item.company_website}
                fieldName="company_website"
                editedFields={editedFields}
                isEditing={isEditing}
                item={item}
                originalItem={originalItem}
                setEditedFields={setEditedFields}
                setItem={setItem}
              />
            </div>
            <div>
              <EditableField
                label="هاتف الشركة"
                value={item.contact_phone}
                fieldName="contact_phone"
                editedFields={editedFields}
                isEditing={isEditing}
                item={item}
                originalItem={originalItem}
                setEditedFields={setEditedFields}
                setItem={setItem}
              />
            </div>
            <div>
              <EditableField
                label="البريد الإلكتروني للشركة"
                value={item.contact_email}
                fieldName="contact_email"
                editedFields={editedFields}
                isEditing={isEditing}
                item={item}
                originalItem={originalItem}
                setEditedFields={setEditedFields}
                setItem={setItem}
              />
            </div>
            {item.job_type && (
              <div>
                <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                  نوع الوظيفة
                </p>
                <p className="text-sm">{item.job_type}</p>
              </div>
            )}
            {item.experience_level && (
              <div>
                <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                  مستوى الخبرة
                </p>
                <p className="text-sm">{item.experience_level}</p>
              </div>
            )}
            {item.education_level && (
              <div>
                <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                  المستوى التعليمي
                </p>
                <p className="text-sm">{item.education_level}</p>
              </div>
            )}
            {item.skills_required && (
              <div className="col-span-2">
                <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                  المهارات المطلوبة
                </p>
                <p className="text-sm">{item.skills_required}</p>
              </div>
            )}
            {item.application_deadline && (
              <div>
                <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                  آخر موعد للتقديم
                </p>
                <p className="text-sm">
                  {new Date(item.application_deadline).toLocaleDateString()}
                </p>
              </div>
            )}
            {item.benefits && (
              <div className="col-span-2">
                <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                  المميزات
                </p>
                <p className="text-sm">{item.benefits}</p>
              </div>
            )}
          </>
        ) : (
          /* Non-job item details */
          <>
            {/* Price and Currency */}
            <EditableField
              label="السعر"
              value={item.price}
              fieldName="price"
              type="number"
              editedFields={editedFields}
              isEditing={isEditing}
              item={item}
              originalItem={originalItem}
              setEditedFields={setEditedFields}
              setItem={setItem}
            />
            <div>
              <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                الخصم
              </p>
              <p className="text-sm">{item.discount || 0}%</p>
            </div>

            {/* Mobile-specific details */}
            {(item.item_as === "shop" || item.item_as === "used") &&
              (item.storage_capacity || item.ram) && (
                <>
                  {item.storage_capacity && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        مساحة التخزين
                      </p>
                      <p className="text-sm">{item.storage_capacity}GB</p>
                    </div>
                  )}
                  {item.ram && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        الرام
                      </p>
                      <p className="text-sm">{item.ram}GB</p>
                    </div>
                  )}
                  {item.operating_system && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        نظام التشغيل
                      </p>
                      <p className="text-sm">{item.operating_system}</p>
                    </div>
                  )}
                  {item.screen_size && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        حجم الشاشة
                      </p>
                      <p className="text-sm">{item.screen_size}"</p>
                    </div>
                  )}
                  {item.battery_capacity && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        البطارية
                      </p>
                      <p className="text-sm">{item.battery_capacity}mAh</p>
                    </div>
                  )}
                  {item.camera_resolution && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        الكاميرا
                      </p>
                      <p className="text-sm">{item.camera_resolution}</p>
                    </div>
                  )}
                  {item.color && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        اللون
                      </p>
                      <p className="text-sm">{item.color}</p>
                    </div>
                  )}
                  {item.condition && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        الحالة
                      </p>
                      <p className="text-sm">{item.condition}</p>
                    </div>
                  )}
                  {item.network_type && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        نوع الشبكة
                      </p>
                      <p className="text-sm">{item.network_type}</p>
                    </div>
                  )}
                </>
              )}

            {/* Car-specific details */}
            {item.item_as === "used" &&
              (item.mileage || item.transmission_type) && (
                <>
                  {item.mileage && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        المسافة المقطوعة
                      </p>
                      <p className="text-sm">{item.mileage} km</p>
                    </div>
                  )}
                  {item.transmission_type && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        ناقل الحركة
                      </p>
                      <p className="text-sm">{item.transmission_type}</p>
                    </div>
                  )}
                  {item.year && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        السنة
                      </p>
                      <p className="text-sm">{item.year}</p>
                    </div>
                  )}
                  {item.fuel_type_id && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        نوع الوقود
                      </p>
                      <p className="text-sm">{item.fuel_type_id}</p>
                    </div>
                  )}
                  {item.type_id && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        نوع السيارة
                      </p>
                      <p className="text-sm">ID: {item.type_id}</p>
                    </div>
                  )}
                  {item.series && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        الفئة
                      </p>
                      <p className="text-sm">{item.series}</p>
                    </div>
                  )}
                </>
              )}

            {/* Property-specific details */}
            {item.item_as === "used" && (item.area || item.bedrooms) && (
              <>
                {item.area && (
                  <div>
                    <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                      المساحة
                    </p>
                    <p className="text-sm">
                      {item.area} قدم مربع
                    </p>
                  </div>
                )}
                {item.bedrooms && (
                  <div>
                    <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                      غرف النوم
                    </p>
                    <p className="text-sm">{item.bedrooms}</p>
                  </div>
                )}
                {item.bathrooms && (
                  <div>
                    <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                      الحمامات
                    </p>
                    <p className="text-sm">{item.bathrooms}</p>
                  </div>
                )}
                {item.floor && (
                  <div>
                    <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                      الطابق
                    </p>
                    <p className="text-sm">{item.floor}</p>
                  </div>
                )}
                {item.year_built && (
                  <div>
                    <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                      سنة البناء
                    </p>
                    <p className="text-sm">{item.year_built}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                    مفروش
                  </p>
                  <p className="text-sm">
                    {item.is_furnished
                      ? "نعم"
                      : "لا"}
                  </p>
                </div>
              </>
            )}

            {/* General item details */}
            <div>
              <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                محجوز
              </p>
              <p className="text-sm">
                {item.reserved
                  ? "نعم"
                  : "لا"}
              </p>
            </div>
            <div>
              <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                مؤرشف
              </p>
              <p className="text-sm">
                {item.archived
                  ? "نعم"
                  : "لا"}
              </p>
            </div>
            <div>
              <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                تاريخ انتهاء الخصم
              </p>
              <p className="text-sm">
                {item.date_end_discount
                  ? new Date(item.date_end_discount).toLocaleDateString()
                  : "غير متوفر"}
              </p>
            </div>
            {item.ended && (
              <div>
                <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                  منتهي
                </p>
                <p className="text-sm">
                  {item.ended
                    ? "نعم"
                    : "لا"}
                </p>
              </div>
            )}
          </>
        )}

        {item.client_details?.account_type === "business" &&
          item.client_details?.business_name && (
            <div>
              <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                اسم النشاط التجاري
              </p>
              <p className="text-sm font-medium truncate">
                {item.client_details.business_name}
              </p>
            </div>
          )}

        {/* User and Item IDs */}
        <div>
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            المستخدم
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {item.user_id}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {item.client_details?.uuid || item.uuid_client}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {(item.client_details?.first_name ?? "") +
              " " +
              (item.client_details?.last_name ?? "")}
          </p>
          <p
            className="text-xs text-muted-foreground truncate text-end"
            style={{ direction: "ltr" }}
          >
            {item.client_details?.phone_number}
          </p>
        </div>
        <div>
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            المنشور
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {item.main_items_id}
          </p>
          <p className="text-xs text-muted-foreground truncate">{item.id}</p>
          <p className="text-xs text-muted-foreground truncate">{item.uuid}</p>
        </div>

        {/* Additional Fields */}
        {item.title_filtered && (
          <div className="col-span-2">
            <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
              العنوان المصفى
            </p>
            <p className="text-sm">{item.title_filtered}</p>
          </div>
        )}
        {item.description_filtered && (
          <div className="col-span-2">
            <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
              الوصف المصفى
            </p>
            <p className="text-sm">{item.description_filtered}</p>
          </div>
        )}
        {item.status_note && (
          <div className="col-span-2">
            <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
              ملاحظة الحالة
            </p>
            <p className="text-sm">{item.status_note}</p>
          </div>
        )}
      </div>
    </div>
  );
};
