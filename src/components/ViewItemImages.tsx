import { ICreatMainItem } from "@/interfaces";
import { useTranslation } from "react-i18next";

export const ViewItemImages = ({ item }: { item: ICreatMainItem }) => {
  const { t } = useTranslation();
  return (
    item.item_as !== "job" && (
      <div className="max-h-[60vh]">
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
    )
  );
};
