import { ICreatMainItem } from "@/interfaces";
import { useTranslation } from "react-i18next";
import { EditableField } from "./EditableField";
import moment from "moment";
import { Dispatch, SetStateAction } from "react";
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
  const { t, i18n } = useTranslation();
  const activated_at = moment(item?.activated_at)
    .locale(i18n.language)
    .fromNow();

  return (
    <div
      className="flex-grow px-4"
      style={{ direction: i18n.language === "ar" ? "rtl" : "ltr" }}
    >
      <div className="my-4">
        <EditableField
          label={t("dialog.labels.title")}
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
              ? t("dialog.labels.business")
              : t("dialog.labels.individual")}
          </Badge>
          {item.section && (
            <Badge variant="outline">Section {item.section}</Badge>
          )}
        </div>
      </div>

      <div className="my-4">
        <EditableField
          label={t("dialog.labels.description")}
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
              {t("dialog.labels.aiDescription")}
            </p>
            <p className="text-sm">{item.ai_description}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-8">
        {/* Position and Basic Info */}
        <EditableField
          label={t("dialog.labels.position")}
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
            {t("dialog.labels.category")}
          </p>
          <p className="text-sm">
            {item.category_name?.ar || t("dialog.messages.notAvailable")}
          </p>
          <p className="text-xs text-muted-foreground">
            ID: {item.category_id}
          </p>
        </div>

        <div>
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            {t("dialog.labels.subcategory")}
          </p>
          <p className="text-sm">
            {item.subcategory_name?.ar || t("dialog.messages.notAvailable")}
          </p>
          <p className="text-xs text-muted-foreground">
            ID: {item.subcategory_id}
          </p>
        </div>

        {item.model_name && (
          <div className="col-span-2">
            <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
              {t("dialog.labels.model")}
            </p>
            <p className="text-sm">
              {item.model_name.ar || t("dialog.messages.notAvailable")}
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
            {t("dialog.labels.address")}
          </p>
          <p className="text-sm">{item.address}</p>
          <p className="text-xs text-muted-foreground">
            Coordinates: {item.latitude}, {item.longitude}
          </p>
        </div>
        <div>
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            {t("dialog.labels.city")}
          </p>
          <p className="text-sm">{item.city}</p>
          <p className="text-xs text-muted-foreground">
            Location ID: {item.location_id}
          </p>
        </div>
        <div>
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            {t("dialog.labels.state")}
          </p>
          <p className="text-sm">{item.state}</p>
        </div>

        {/* Contact Information */}
        <div>
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            {t("dialog.labels.whatsappContact")}
          </p>
          <p className="text-sm" style={{ direction: "ltr" }}>
            {item.contact_whatsapp || t("dialog.messages.notAvailable")}
          </p>
        </div>
        {item.item_as !== "job" && (
          <div>
            <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
              {t("dialog.labels.phone")}
            </p>
            <p className="text-sm">
              {item.contact_phone || t("dialog.messages.notAvailable")}
            </p>
          </div>
        )}

        {/* Stats */}
        <div>
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            {t("dialog.labels.views")}
          </p>
          <p className="text-sm">{item.view_count || 0}</p>
        </div>
        <div>
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            {t("dialog.labels.favorites")}
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
            {t("dialog.labels.created")}
          </p>
          <p className="text-sm">
            {activated_at.replace(/^منذ\s*/, "").replace(/\s*ago$/, "")}
          </p>
          {item.updated_at && (
            <p className="text-xs text-muted-foreground">
              Updated: {moment(item.updated_at).locale(i18n.language).fromNow()}
            </p>
          )}
          {item.deleted_at && (
            <p className="text-xs text-destructive">
              Deleted: {moment(item.deleted_at).locale(i18n.language).fromNow()}
            </p>
          )}
        </div>

        {/* Delivery and Purchase Options */}
        <div>
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            {t("dialog.labels.deliveryAvailable")}
          </p>
          <p className="text-sm">
            {item.delivery_available
              ? t("dialog.messages.yes")
              : t("dialog.messages.no")}
          </p>
        </div>
        <div>
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            {t("dialog.labels.installment")}
          </p>
          <p className="text-sm">
            {item.installment
              ? t("dialog.messages.yes")
              : t("dialog.messages.no")}
          </p>
        </div>
        <div>
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            {t("dialog.labels.obo")}
          </p>
          <p className="text-sm">
            {item.obo ? t("dialog.messages.yes") : t("dialog.messages.no")}
          </p>
        </div>

        {/* Job-specific details or item details */}
        {item.item_as === "job" ? (
          <>
            <div className="col-span-2">
              <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                {t("dialog.labels.jobType")}
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
                    {t("dialog.labels.employeeLooking")}
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
                    {t("dialog.labels.companyLooking")}
                  </label>
                </div>
              ) : (
                <p className="text-sm">
                  {item.need
                    ? t("dialog.labels.employeeLooking")
                    : t("dialog.labels.companyLooking")}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                {t("dialog.labels.remoteJob")}
              </p>
              <p className="text-sm">
                {item.remote_job
                  ? t("dialog.messages.yes")
                  : t("dialog.messages.no")}
              </p>
            </div>
            <div>
              <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                {t("dialog.labels.jobEnded")}
              </p>
              <p className="text-sm">
                {item.ended
                  ? t("dialog.messages.yes")
                  : t("dialog.messages.no")}
              </p>
            </div>
            <div className="col-span-2">
              <EditableField
                label={t("dialog.labels.companyName")}
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
                label={t("dialog.labels.companyWebsite")}
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
                label={t("dialog.labels.companyPhone")}
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
                label={t("dialog.labels.companyEmail")}
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
                  {t("dialog.labels.jobTypeCategory")}
                </p>
                <p className="text-sm">{item.job_type}</p>
              </div>
            )}
            {item.experience_level && (
              <div>
                <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                  {t("dialog.labels.experienceLevel")}
                </p>
                <p className="text-sm">{item.experience_level}</p>
              </div>
            )}
            {item.education_level && (
              <div>
                <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                  {t("dialog.labels.educationLevel")}
                </p>
                <p className="text-sm">{item.education_level}</p>
              </div>
            )}
            {item.skills_required && (
              <div className="col-span-2">
                <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                  {t("dialog.labels.skillsRequired")}
                </p>
                <p className="text-sm">{item.skills_required}</p>
              </div>
            )}
            {item.application_deadline && (
              <div>
                <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                  {t("dialog.labels.applicationDeadline")}
                </p>
                <p className="text-sm">
                  {new Date(item.application_deadline).toLocaleDateString()}
                </p>
              </div>
            )}
            {item.benefits && (
              <div className="col-span-2">
                <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                  {t("dialog.labels.benefits")}
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
              label={t("dialog.labels.price")}
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
                {t("dialog.labels.discount")}
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
                        {t("dialog.labels.storage")}
                      </p>
                      <p className="text-sm">{item.storage_capacity}GB</p>
                    </div>
                  )}
                  {item.ram && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        {t("dialog.labels.ram")}
                      </p>
                      <p className="text-sm">{item.ram}GB</p>
                    </div>
                  )}
                  {item.operating_system && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        {t("dialog.labels.operatingSystem")}
                      </p>
                      <p className="text-sm">{item.operating_system}</p>
                    </div>
                  )}
                  {item.screen_size && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        {t("dialog.labels.screenSize")}
                      </p>
                      <p className="text-sm">{item.screen_size}"</p>
                    </div>
                  )}
                  {item.battery_capacity && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        {t("dialog.labels.battery")}
                      </p>
                      <p className="text-sm">{item.battery_capacity}mAh</p>
                    </div>
                  )}
                  {item.camera_resolution && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        {t("dialog.labels.camera")}
                      </p>
                      <p className="text-sm">{item.camera_resolution}</p>
                    </div>
                  )}
                  {item.color && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        {t("dialog.labels.color")}
                      </p>
                      <p className="text-sm">{item.color}</p>
                    </div>
                  )}
                  {item.condition && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        {t("dialog.labels.condition")}
                      </p>
                      <p className="text-sm">{item.condition}</p>
                    </div>
                  )}
                  {item.network_type && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        {t("dialog.labels.networkType")}
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
                        {t("dialog.labels.mileage")}
                      </p>
                      <p className="text-sm">{item.mileage} km</p>
                    </div>
                  )}
                  {item.transmission_type && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        {t("dialog.labels.transmission")}
                      </p>
                      <p className="text-sm">{item.transmission_type}</p>
                    </div>
                  )}
                  {item.year && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        {t("dialog.labels.year")}
                      </p>
                      <p className="text-sm">{item.year}</p>
                    </div>
                  )}
                  {item.fuel_type_id && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        {t("dialog.labels.fuelType")}
                      </p>
                      <p className="text-sm">{item.fuel_type_id}</p>
                    </div>
                  )}
                  {item.type_id && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        {t("dialog.labels.carType")}
                      </p>
                      <p className="text-sm">ID: {item.type_id}</p>
                    </div>
                  )}
                  {item.series && (
                    <div>
                      <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                        {t("dialog.labels.series")}
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
                      {t("dialog.labels.area")}
                    </p>
                    <p className="text-sm">
                      {item.area} {t("dialog.labels.sqft")}
                    </p>
                  </div>
                )}
                {item.bedrooms && (
                  <div>
                    <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                      {t("dialog.labels.bedrooms")}
                    </p>
                    <p className="text-sm">{item.bedrooms}</p>
                  </div>
                )}
                {item.bathrooms && (
                  <div>
                    <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                      {t("dialog.labels.bathrooms")}
                    </p>
                    <p className="text-sm">{item.bathrooms}</p>
                  </div>
                )}
                {item.floor && (
                  <div>
                    <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                      {t("dialog.labels.floor")}
                    </p>
                    <p className="text-sm">{item.floor}</p>
                  </div>
                )}
                {item.year_built && (
                  <div>
                    <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                      {t("dialog.labels.yearBuilt")}
                    </p>
                    <p className="text-sm">{item.year_built}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                    {t("dialog.labels.furnished")}
                  </p>
                  <p className="text-sm">
                    {item.is_furnished
                      ? t("dialog.messages.yes")
                      : t("dialog.messages.no")}
                  </p>
                </div>
              </>
            )}

            {/* General item details */}
            <div>
              <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                {t("dialog.labels.reserved")}
              </p>
              <p className="text-sm">
                {item.reserved
                  ? t("dialog.messages.yes")
                  : t("dialog.messages.no")}
              </p>
            </div>
            <div>
              <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                {t("dialog.labels.archived")}
              </p>
              <p className="text-sm">
                {item.archived
                  ? t("dialog.messages.yes")
                  : t("dialog.messages.no")}
              </p>
            </div>
            <div>
              <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                {t("dialog.labels.discountEndDate")}
              </p>
              <p className="text-sm">
                {item.date_end_discount
                  ? new Date(item.date_end_discount).toLocaleDateString()
                  : t("dialog.messages.notAvailable")}
              </p>
            </div>
            {item.ended && (
              <div>
                <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                  {t("dialog.labels.ended")}
                </p>
                <p className="text-sm">
                  {item.ended
                    ? t("dialog.messages.yes")
                    : t("dialog.messages.no")}
                </p>
              </div>
            )}
          </>
        )}

        {item.client_details?.account_type === "business" &&
          item.client_details?.business_name && (
            <div>
              <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
                {t("dialog.labels.businessName")}
              </p>
              <p className="text-sm font-medium truncate">
                {item.client_details.business_name}
              </p>
            </div>
          )}

        {/* User and Item IDs */}
        <div>
          <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
            {t("dashboard.messages.user")}
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
            {t("dialog.labels.item")}
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
              {t("dialog.labels.filteredTitle")}
            </p>
            <p className="text-sm">{item.title_filtered}</p>
          </div>
        )}
        {item.description_filtered && (
          <div className="col-span-2">
            <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
              {t("dialog.labels.filteredDescription")}
            </p>
            <p className="text-sm">{item.description_filtered}</p>
          </div>
        )}
        {item.status_note && (
          <div className="col-span-2">
            <p className="text-xs font-normal text-blue-600 dark:text-blue-400">
              {t("dialog.labels.statusNote")}
            </p>
            <p className="text-sm">{item.status_note}</p>
          </div>
        )}
      </div>
    </div>
  );
};
