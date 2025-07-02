import { ICreatMainItem } from "@/interfaces";
import { Textarea } from "./ui/textarea";
import { Dispatch, SetStateAction } from "react";
import { Input } from "./ui/input";
import { useTranslation } from "react-i18next";

export const EditableField = ({
  label,
  value,
  fieldName,
  isTextarea = false,
  type = "text",
  editedFields,
  item,
  setEditedFields,
  setItem,
  originalItem,
  isEditing,
}: {
  label: string;
  value: string | number | boolean | null | undefined;
  fieldName: keyof ICreatMainItem;
  isTextarea?: boolean;
  type?: string;
  setItem: Dispatch<SetStateAction<ICreatMainItem | null>>;
  item: ICreatMainItem | null;
  setEditedFields: Dispatch<SetStateAction<Partial<ICreatMainItem>>>;
  editedFields: Partial<ICreatMainItem>;
  originalItem: ICreatMainItem | null;
  isEditing: boolean;
}) => {
  const { t } = useTranslation();

  const handleFieldChange = (field: keyof ICreatMainItem, value: string | number | undefined | null) => {
    if (!item) return;

    setItem({ ...item, [field]: value });

    // Track changed fields by comparing with original
    if (originalItem && originalItem[field] !== value) {
      setEditedFields((prev) => ({ ...prev, [field]: value }));
    } else {
      // If value matches original, remove from changed fields
      const { [field]: _, ...rest } = editedFields;
      setEditedFields(rest);
    }
  };

  const handleFieldChangeRadio = (field: keyof ICreatMainItem, value: boolean | string) => {
    if (!item) return;

    setItem({ ...item, [field]: value });

    // Track changed fields by comparing with original
    if (originalItem && originalItem[field] !== value) {
      setEditedFields((prev) => ({ ...prev, [field]: value }));
    } else {
      // If value matches original, remove from changed fields
      const { [field]: _, ...rest } = editedFields;
      setEditedFields(rest);
    }
  };

  if (fieldName === "need") {
    return (
      <div className="space-y-1">
        <label className="text-sm font-medium">{label}</label>
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <Input
                type="radio"
                name={fieldName}
                checked={value === true}
                onChange={() => {
                  handleFieldChangeRadio(fieldName, true)
                }}
                className="h-4 w-4"
              />
              {t("editableField.employeeLooking")}
            </label>
            <label className="flex items-center gap-2">
              <Input
                type="radio"
                name={fieldName}
                checked={value === false}
                onChange={() => {
                  handleFieldChangeRadio(fieldName, false)
                }}
                className="h-4 w-4"
              />
              {t("editableField.companyLooking")}
            </label>
          </div>
        ) : (
          <p>{value ? t("editableField.employeeLooking") : t("editableField.companyLooking")}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      {isEditing ? (
        isTextarea ? (
          <Textarea
            value={value?.toString() || ""}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className="min-h-[100px] bg-slate-800"
          />
        ) : (
          <Input
            type={type}
            value={value?.toString() || ""}
            className="bg-slate-800"
            onChange={(e) => {
              const val =
                type === "number"
                  ? parseFloat(e.target.value) || 0
                  : e.target.value;
              handleFieldChange(fieldName, val);
            }}
          />
        )
      ) : (
        <p>{value || t("editableField.notAvailable")}</p>
      )}
    </div>
  );
};