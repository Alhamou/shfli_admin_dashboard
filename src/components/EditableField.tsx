import { ICreatMainItem } from "@/interfaces";
import { formatPrice, getPriceDiscount } from "@/lib/helpFunctions";
import { Dispatch, SetStateAction } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

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
  className = "",
}: {
  label: string;
  value: string | number | boolean | null | undefined;
  fieldName: keyof ICreatMainItem;
  isTextarea?: boolean;
  type?: string;
  setItem: Dispatch<SetStateAction<ICreatMainItem | null>>;
  item: ICreatMainItem;
  setEditedFields: Dispatch<SetStateAction<Partial<ICreatMainItem>>>;
  editedFields: Partial<ICreatMainItem>;
  originalItem: ICreatMainItem | null;
  isEditing: boolean;
  className?: string;
}) => {

  const handleFieldChange = (
    field: keyof ICreatMainItem,
    value: string | number | undefined | null
  ) => {
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

  const handleFieldChangeRadio = (
    field: keyof ICreatMainItem,
    value: boolean | string
  ) => {
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
        <div className="text-xs font-normal text-blue-600 dark:text-blue-400">
          {label}
        </div>
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <h3 className="flex items-center gap-2">
              <Input
                type="radio"
                name={fieldName}
                checked={value === true}
                onChange={() => {
                  handleFieldChangeRadio(fieldName, true);
                }}
                className="h-4 w-4 text-sm"
              />
              يبحث عن عمل
            </h3>
            <h3 className="flex items-center gap-2">
              <Input
                type="radio"
                name={fieldName}
                checked={value === false}
                onChange={() => {
                  handleFieldChangeRadio(fieldName, false);
                }}
                className="h-4 w-4"
              />
              تبحث عن موظف
            </h3>
          </div>
        ) : (
          <p>
            {value
              ? "يبحث عن عمل"
              : "تبحث عن موظف"}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <h3 className="text-xs font-normal text-blue-600 dark:text-blue-400">
        {label}
      </h3>
      {isEditing ? (
        isTextarea ? (
          <Textarea
            value={value?.toString() || ""}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className={`min-h-[100px] border-2 border-primary/30 focus-visible:border-primary transition-colors ${className}`}
          />
        ) : (
          <Input
            type={type}
            value={value?.toString() || ""}
            className={`border-2 border-primary/30 focus-visible:border-primary transition-colors ${className}`}
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
        <p className={`text-sm ${className}`}>
          {(value !== undefined && value !== null)
            ? fieldName === 'price' ? formatPrice(
                item.discount
                  ? getPriceDiscount(item.price, item.discount)
                  : item.price,
                item.currency
              )
            : value : "غير متوفر"}
        </p>
      )}
    </div>
  );
};
