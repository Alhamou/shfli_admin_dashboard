import { ICreatMainItem } from "@/interfaces";
import { Textarea } from "./ui/textarea";
import { Dispatch, SetStateAction } from "react";
import { Input } from "./ui/input";

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
  value: string | number | null | undefined;
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
  const handleFieldChange = (field: keyof ICreatMainItem, value: any) => {
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

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      {isEditing ? (
        isTextarea ? (
          <Textarea
            value={value?.toString() || ""}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className="min-h-[100px]"
          />
        ) : (
          <Input
            type={type}
            value={value?.toString() || ""}
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
        <p>{value || "N/A"}</p>
      )}
    </div>
  );
};
