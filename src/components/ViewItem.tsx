import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Save, Edit } from "lucide-react";
import { ICreatMainItem } from "@/interfaces";
import { getItem, updateItem, getReasons } from "@/services/restApiServices";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { EditableField } from "./EditableField";
import { useTranslation } from "react-i18next";

interface ItemDetailViewProps {
  uuid: string;
  open: boolean;
  onClose: () => void;
  onStatusChange?: () => void;
  onItemUpdate: (updatedItem: ICreatMainItem) => void;
}

export function ItemDetailView({
  uuid,
  open,
  onClose,
  onStatusChange,
  onItemUpdate,
}: ItemDetailViewProps) {
  const { t } = useTranslation();
  const [item, setItem] = useState<ICreatMainItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [blockReasons, setBlockReasons] = useState<string[]>([]);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState<Partial<ICreatMainItem>>({});
  const [originalItem, setOriginalItem] = useState<ICreatMainItem | null>(null);

  const fetchItem = async (uuid: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getItem(uuid);
      setItem(data[0]);
      setOriginalItem(data[0]);
      return data[0];
    } catch (err) {
      setError(t("messages.loadingError"));
      toast.error(t("messages.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false);
      setEditedFields({});
      if (originalItem) setItem(originalItem);
    } else {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!item || !originalItem || Object.keys(editedFields).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      await updateItem(item.uuid, editedFields);
      toast.success(t("messages.updateSuccess"));
      setIsEditing(false);
      setOriginalItem(item);
      setEditedFields({});
      const updatedItem = await fetchItem(uuid);
      if (updatedItem) {
        onItemUpdate(updatedItem);
      }
    } catch (error) {
      toast.error(t("messages.updateError"));
    }
  };

  const fetchBlockReasons = async () => {
    setLoading(true);
    try {
      const response = await getReasons();
      setBlockReasons(item?.item_as === "job" ? response.jobs : response.items);
    } catch (err) {
      toast.error(t("messages.reasonsError"));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (newStatus: "active" | "blocked") => {
    if (!item) return;

    setUpdatingStatus(true);
    try {
      let description: string | null = item.description;

      if (newStatus === "blocked") {
        description = `${
          selectedReason === t("dialog.messages.blockReason.other")
            ? customReason
            : selectedReason
        }`;
      } else {
        description = null;
      }

      await updateItem(item.uuid, {
        status_note: description,
        is_active: newStatus,
      });

      toast.success(
        t("messages.statusUpdateSuccess", {
          status: t(
            `messages.status${
              newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
            }`
          ),
        })
      );

      const updatedItem = await fetchItem(item.uuid);
      if (updatedItem) {
        onItemUpdate(updatedItem);
      }
    } catch (err) {
      toast.error(t("messages.statusUpdateError"));
    } finally {
      setUpdatingStatus(false);
      setShowReasonInput(false);
      setSelectedReason("");
      setCustomReason("");
    }
  };

  const handleBlockAction = () => {
    if (item?.is_active === "active") {
      setShowReasonInput(true);
    } else {
      handleStatusToggle("active");
    }
  };

  useEffect(() => {
    if (open) {
      fetchItem(uuid);
      fetchBlockReasons();
      setShowReasonInput(false);
      setSelectedReason("");
      setCustomReason("");
    } else {
      setItem(null);
    }
    setIsEditing(false);
  }, [open, uuid]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] lg:max-w-[90vw] xl:max-w-[85vw] w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <span className="text-lg sm:text-xl">
              {t("dialog.itemDetails")}
            </span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="sr-only">{t("dialog.messages.loading")}</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            {error}
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                fetchItem(uuid);
              }}
            >
              {t("dialog.buttons.retry")}
            </Button>
          </div>
        ) : item ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Left Column - Images */}
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-4 max-h-[60vh] overflow-y-auto pr-2">
                {item.images?.length > 0 ? (
                  item.images.map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={image.url}
                        alt={`${item.title} - ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-item.png";
                        }}
                      />
                    </div>
                  ))
                ) : item.thumbnail ? (
                  <div className="relative aspect-square col-span-2 sm:col-span-3 lg:col-span-1">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-item.png";
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-800 aspect-square rounded-lg flex items-center justify-center col-span-2 sm:col-span-3 lg:col-span-1">
                    <span className="text-gray-500">
                      {t("dialog.messages.noImages")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Middle Column - Details */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              <div className="space-y-2">
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
                  {item.item_for && (
                    <Badge variant="secondary">{item.item_for}</Badge>
                  )}
                  <Badge
                    variant={
                      item.is_active === "active" ? "default" : "destructive"
                    }
                  >
                    {item.is_active}
                  </Badge>
                </div>
              </div>

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

              <div className="space-y-2">
                <h3 className="font-semibold">
                  {t("dialog.labels.categoryInfo")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                  <div>
                    <p className="text-sm font-medium">
                      {t("dialog.labels.category")}
                    </p>
                    <p>
                      {item.category_name?.en ||
                        item.category_name?.ar ||
                        t("dialog.messages.notAvailable")}
                    </p>
                    {item.category_name?.ar && (
                      <p className="text-xs text-muted-foreground">
                        ({item.category_name.ar})
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      {t("dialog.labels.subcategory")}
                    </p>
                    <p>
                      {item.subcategory_name?.en ||
                        item.subcategory_name?.ar ||
                        t("dialog.messages.notAvailable")}
                    </p>
                    {item.subcategory_name?.ar && (
                      <p className="text-xs text-muted-foreground">
                        ({item.subcategory_name.ar})
                      </p>
                    )}
                  </div>

                  {item.model_name && (
                    <div>
                      <p className="text-sm font-medium">
                        {t("dialog.labels.model")}
                      </p>
                      <p>
                        {item.model_name.en ||
                          item.model_name.ar ||
                          t("dialog.messages.notAvailable")}
                      </p>
                      {item.model_name.ar && (
                        <p className="text-xs text-muted-foreground">
                          ({item.model_name.ar})
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">
                    {t("dialog.labels.location")}
                  </h3>
                  <p>
                    {item.city}, {item.state}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.address}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">
                    {t("dialog.labels.whatsappContact")}
                  </h3>
                  <p>
                    {item.contact_whatsapp || t("dialog.messages.notAvailable")}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">{t("dialog.labels.stats")}</h3>
                  <div className="flex items-center gap-2">
                    <span>
                      {t("dialog.labels.views")}: {item.view_count || 0}
                    </span>
                    <span>
                      {t("dialog.labels.favorites")}: {item.favorite_at ? 1 : 0}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("dialog.labels.created")}:{" "}
                    {new Date(item.activated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Job-specific details */}
              {item.item_as === "job" ? (
                <div className="space-y-4">
                  <h3 className="font-semibold">
                    {t("dialog.labels.jobDetails")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        {t("dialog.labels.jobType")}
                      </p>
                      {isEditing ? (
                        <div className="flex flex-col gap-2">
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
                        <p>
                          {item.need
                            ? t("dialog.labels.employeeLooking")
                            : t("dialog.labels.companyLooking")}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {t("dialog.labels.remoteJob")}
                      </p>
                      <p>
                        {item.remote_job
                          ? t("dialog.messages.yes")
                          : t("dialog.messages.no")}
                      </p>
                    </div>
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
                </div>
              ) : (
                /* Non-job item details */
                <div className="space-y-4">
                  <h3 className="font-semibold">
                    {t("dialog.labels.itemDetails")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    {/* Mobile-specific details */}
                    {(item.item_as === "shop" || item.item_as === "used") &&
                      item.storage_capacity && (
                        <>
                          <div>
                            <p className="text-sm font-medium">
                              {t("dialog.labels.storage")}
                            </p>
                            <p>{item.storage_capacity}GB</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {t("dialog.labels.ram")}
                            </p>
                            <p>{item.ram}GB</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {t("dialog.labels.operatingSystem")}
                            </p>
                            <p>
                              {item.operating_system ||
                                t("dialog.messages.notAvailable")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {t("dialog.labels.screenSize")}
                            </p>
                            <p>{item.screen_size}"</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {t("dialog.labels.battery")}
                            </p>
                            <p>{item.battery_capacity}mAh</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {t("dialog.labels.camera")}
                            </p>
                            <p>
                              {item.camera_resolution ||
                                t("dialog.messages.notAvailable")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {t("dialog.labels.color")}
                            </p>
                            <p>
                              {item.color || t("dialog.messages.notAvailable")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {t("dialog.labels.condition")}
                            </p>
                            <p>
                              {item.condition ||
                                t("dialog.messages.notAvailable")}
                            </p>
                          </div>
                        </>
                      )}

                    {/* Car-specific details */}
                    {item.item_as === "used" && item.mileage && (
                      <>
                        <div>
                          <p className="text-sm font-medium">
                            {t("dialog.labels.mileage")}
                          </p>
                          <p>{item.mileage} km</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {t("dialog.labels.transmission")}
                          </p>
                          <p>
                            {item.transmission_type ||
                              t("dialog.messages.notAvailable")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {t("dialog.labels.year")}
                          </p>
                          <p>
                            {item.year || t("dialog.messages.notAvailable")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {t("dialog.labels.fuelType")}
                          </p>
                          <p>
                            {item.fuel_type_id ||
                              t("dialog.messages.notAvailable")}
                          </p>
                        </div>
                      </>
                    )}

                    {/* Property-specific details */}
                    {item.item_as === "used" && item.area && (
                      <>
                        <div>
                          <p className="text-sm font-medium">
                            {t("dialog.labels.area")}
                          </p>
                          <p>
                            {item.area} {t("dialog.labels.sqft")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {t("dialog.labels.bedrooms")}
                          </p>
                          <p>
                            {item.bedrooms || t("dialog.messages.notAvailable")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {t("dialog.labels.bathrooms")}
                          </p>
                          <p>
                            {item.bathrooms ||
                              t("dialog.messages.notAvailable")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {t("dialog.labels.floor")}
                          </p>
                          <p>
                            {item.floor || t("dialog.messages.notAvailable")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {t("dialog.labels.yearBuilt")}
                          </p>
                          <p>
                            {item.year_built ||
                              t("dialog.messages.notAvailable")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {t("dialog.labels.furnished")}
                          </p>
                          <p>
                            {item.is_furnished
                              ? t("dialog.messages.yes")
                              : t("dialog.messages.no")}
                          </p>
                        </div>
                      </>
                    )}

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

                    {/* General item details */}
                    <div>
                      <p className="text-sm font-medium">
                        {t("dialog.labels.reserved")}
                      </p>
                      <p>
                        {item.reserved
                          ? t("dialog.messages.yes")
                          : t("dialog.messages.no")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {t("dialog.labels.discountEndDate")}
                      </p>
                      <p>
                        {item.date_end_discount
                          ? new Date(
                              item.date_end_discount
                            ).toLocaleDateString()
                          : t("dialog.messages.notAvailable")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {showReasonInput && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium">
                    {t("dialog.labels.selectReason")}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start whitespace-normal text-left h-auto min-h-[40px] py-2"
                      >
                        {selectedReason || t("dialog.labels.selectReason")}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-h-80 overflow-y-scroll">
                      {blockReasons.map((reason) => (
                        <DropdownMenuItem
                          key={reason}
                          onClick={() => setSelectedReason(reason)}
                          style={{ direction: "rtl" }}
                        >
                          {reason}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem
                        onClick={() =>
                          setSelectedReason(
                            t("dialog.messages.blockReason.other")
                          )
                        }
                        style={{ direction: "rtl" }}
                      >
                        {t("dialog.messages.blockReason.other")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {selectedReason ===
                    t("dialog.messages.blockReason.other") && (
                    <Textarea
                      placeholder={t("dialog.labels.specifyReason")}
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                    />
                  )}

                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowReasonInput(false);
                        setSelectedReason("");
                        setCustomReason("");
                      }}
                    >
                      {t("dialog.buttons.cancel")}
                    </Button>
                    <Button
                      onClick={() => handleStatusToggle("blocked")}
                      disabled={
                        !selectedReason ||
                        (selectedReason ===
                          t("dialog.messages.blockReason.other") &&
                          !customReason) ||
                        updatingStatus
                      }
                    >
                      {t("dialog.buttons.confirm")}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Actions */}
            <div className="md:col-span-1 flex flex-row md:flex-col gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditToggle}
                    className="flex-1 sm:flex-none"
                  >
                    <X className="h-4 w-4 mr-2" /> {t("dialog.buttons.cancel")}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSave}
                    disabled={Object.keys(editedFields).length === 0}
                    className="flex-1 sm:flex-none"
                  >
                    <Save className="h-4 w-4 mr-2" /> {t("dialog.buttons.save")}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditToggle}
                  className="flex-1 sm:flex-none"
                >
                  <Edit className="h-4 w-4 mr-2" /> {t("dialog.buttons.edit")}
                </Button>
              )}
              <Button variant="outline" className="flex-1 lg:flex-none">
                {t("dialog.buttons.message")}
              </Button>
              <Button variant="outline" className="flex-1 lg:flex-none">
                {t("dialog.buttons.share")}
              </Button>
              <Button
                variant="outline"
                className="flex-1 lg:flex-none"
                disabled={updatingStatus}
              >
                {t("dialog.buttons.report")}
              </Button>
            </div>

            {/* Bottom Status Bar */}
            <div className="col-span-full border-t pt-4 mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">
                  {t("dialog.labels.status")}:
                </span>
                <Badge
                  variant={
                    item.is_active === "active" ? "default" : "destructive"
                  }
                >
                  {item.is_active}
                </Badge>
                <span className="text-sm">
                  {item.status_note ? item.status_note : ""}
                </span>
              </div>
              <Button
                onClick={handleBlockAction}
                variant={
                  item.is_active === "active" ? "destructive" : "default"
                }
                disabled={updatingStatus}
                className="w-full sm:w-auto"
              >
                {updatingStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {item.is_active === "active"
                  ? t("dialog.buttons.block")
                  : t("dialog.buttons.unblock")}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
