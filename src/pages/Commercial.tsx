import { useState, useEffect, useCallback, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import moment from "moment";
import {
  formatPrice,
  getPriceDiscount,
  isUUIDv4,
  toQueryString,
  updateItemInArray,
} from "@/lib/helpFunctions";
import "moment";
import { getAllCommercialItems, updateItem } from "@/services/restApiServices";
import { ICreatMainItem } from "@/interfaces";
import { CustomBadge } from "@/components/ui/custom-badge";
import { Eye } from "lucide-react";
import { ItemDetailView } from "@/components/ViewItem";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const initialQuery = { page: 1, limit: 25, total: 0 };

export default function DashboardHome() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<ICreatMainItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(initialQuery);
  const [hasMore, setHasMore] = useState(true);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [selectedItemUuid, setSelectedItemUuid] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"items" | "jobs">("items");

  const fetchItems = useCallback(
    async (
      page: number,
      limit: number,
      search: string = "",
      clientUuid: string = ""
    ) => {
      if (loading) return;

      setLoading(true);
      try {
        const query = toQueryString({
          page,
          limit,
          item_as: activeTab === "jobs" ? "job" : "item",
          ...(search !== ""
            ? isUUIDv4(search)
              ? { uuid: search }
              : { id: search }
            : {}),
          ...(clientUuid !== ""
            ? isUUIDv4(clientUuid)
              ? { uuid_client: clientUuid }
              : { user_id: clientUuid }
            : {}),
        });
        const response = await getAllCommercialItems(query);
        setItems((prev) =>
          page === 1 ? response.result : [...prev, ...response.result]
        );
        setPagination({
          page,
          limit,
          total: response.pagination.total,
        });
        setHasMore(response.result.length === limit);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    },
    [loading, activeTab]
  );

  // Initial fetch
  useEffect(() => {
    fetchItems(pagination.page, pagination.limit);
  }, [activeTab]);

  const handleItemUpdate = useCallback(
    (updatedItem: ICreatMainItem) => {
      // Update items in the table
      setItems((prev) => updateItemInArray(prev, updatedItem));

      // If the updated item is currently being viewed, update it in the dialog
      if (selectedItemUuid === updatedItem.uuid) {
        // This will trigger a refetch in ItemDetailView
        setSelectedItemUuid(null);
      }
    },
    [selectedItemUuid]
  );

  const handlePositionToggle = async (item: ICreatMainItem) => {
    const newPosition = item.position === 1 ? 0 : 1;
    try {
      await updateItem(item.uuid, { position: newPosition });
      fetchItems(pagination.page, pagination.limit);
      toast.success(t("messages.updateSuccess"));
    } catch (error) {
      toast.error(t("messages.updateError"));
    }
  };

  // Infinite scroll effect
  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container || loading || !hasMore) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Load more when we're within 200px of the bottom
      if (scrollHeight - (scrollTop + clientHeight) < 200) {
        fetchItems(pagination.page + 1, pagination.limit);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, pagination, fetchItems]);

  useEffect(() => {
    moment.updateLocale("ar", {
      relativeTime: {
        future: "في %s",
        past: "منذ %s",
        s: "ثوان",
        m: "دقيقة",
        mm: "%d دقائق",
        h: "ساعة",
        hh: "%d ساعات",
        d: "يوم",
        dd: "%d أيام",
        M: "شهر",
        MM: "%d أشهر",
        y: "سنة",
        yy: "%d سنوات",
      },
    });
  }, []);

  const getStatusBadge = (status: "active" | "pending" | "blocked") => {
    return (
      <CustomBadge variant={status} size="lg" className="whitespace-nowrap">
        {t(`dashboard.statusTypes.${status}`)}
      </CustomBadge>
    );
  };

  // Filter items based on active tab
  const filteredItems = items.filter((item) => {
    if (activeTab === "jobs") return item.item_as === "job";
    return item.item_as !== "job";
  });

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header section */}
      <div className="sticky top-0 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{t("dashboard.title")}</div>
          </div>
        </div>

        <div className="rounded-lg shadow">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "items" | "jobs")}
            className="mb-4"
            style={{ direction: i18n.language === "ar" ? "rtl" : "ltr" }}
          >
            <TabsList>
              <TabsTrigger value="items">
                {t("dashboard.tabs.items")}
              </TabsTrigger>
              <TabsTrigger value="jobs">{t("dashboard.tabs.jobs")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Table header - also sticky below the tabs section */}
        <div className="rounded-md border bg-background">
          <Table>
            <TableHeader className="sticky top-[180px] bg-background">
              <TableRow>
                <TableHead>{t("dashboard.tableHeaders.position")}</TableHead>
                <TableHead>{t("dashboard.tableHeaders.item")}</TableHead>
                <TableHead>{t("dashboard.tableHeaders.category")}</TableHead>
                <TableHead>{t("dashboard.tableHeaders.price")}</TableHead>
                <TableHead>{t("dashboard.tableHeaders.location")}</TableHead>
                <TableHead>{t("dashboard.tableHeaders.stats")}</TableHead>
                <TableHead>{t("dashboard.tableHeaders.status")}</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>
      </div>

      {/* Scrollable content section */}
      <div
        className="flex-1 overflow-auto"
        ref={tableContainerRef}
        style={{ maxHeight: "calc(100vh - 250px)" }}
      >
        <div className="rounded-md border border-t-0">
          <Table>
            <TableBody>
              {filteredItems.map((item, index) => {
                const activated_at = moment(item.activated_at)
                  .locale(i18n.language)
                  .fromNow();
                return (
                  <TableRow key={`${index}`}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={item.position === 1}
                        onChange={() => handlePositionToggle(item)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </TableCell>
                    <TableCell
                      className="flex items-center gap-4 cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedItemUuid(item.uuid)}
                    >
                      {item.item_as === "job" ? (
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={
                              item.thumbnail ||
                              (item.images && item.images[0]?.url)
                            }
                            alt={item.title}
                          />
                          <AvatarFallback>
                            {item.title.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="relative h-40 w-40 flex-shrink-0">
                          <img
                            className="h-full w-full rounded-md object-cover"
                            src={
                              item.thumbnail ||
                              (item.images && item.images[0]?.url)
                            }
                            alt={item.title}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder-item.png";
                            }}
                          />
                        </div>
                      )}
                      <div className="space-y-1 flex-1 min-w-0 max-w-40">
                        {item.item_as === "job" ? (
                          <p className="font-normal text-blue-600 dark:text-blue-400 truncate">
                            {item.need
                              ? t("dialog.labels.employeeLooking")
                              : t("dialog.labels.companyLooking")}
                          </p>
                        ) : (
                          <></>
                        )}
                        <p className="font-medium truncate">{item.title}</p>
                        <p
                          className={`text-sm text-muted-foreground ${
                            item.item_as === "job"
                              ? "line-clamp-3"
                              : "line-clamp-2"
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p>
                          {item.category_name?.ar ||
                            t("dashboard.messages.notAvailable")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.subcategory_name?.ar ||
                            t("dashboard.messages.notAvailable")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.price ? (
                        <div className="space-y-1">
                          <p className="font-medium">
                            {formatPrice(
                              item.discount
                                ? getPriceDiscount(item.price, item.discount)
                                : item.price,
                              item?.currency
                            )}
                          </p>
                          {item.discount > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {t("dashboard.messages.discount")}:{" "}
                              {item.discount}%
                            </p>
                          )}
                        </div>
                      ) : (
                        t("dashboard.messages.notAvailable")
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p>{item.city}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.state}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span>{item.view_count || 0}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activated_at
                            .replace(/^منذ\s*/, "")
                            .replace(/\s*ago$/, "")}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {t("dashboard.messages.user")}: <br /> {item.user_id}
                        </p>
                        <p
                          className="text-xs text-muted-foreground truncate text-end"
                          style={{ direction: "ltr" }}
                        >
                          {item.client_details?.phone_number}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {(item.client_details?.first_name ?? "") +
                            " " +
                            (item.client_details?.last_name ?? "")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(item.is_active)}
                        {item.account_type && (
                          <CustomBadge
                            variant={"unknown"}
                            size="lg"
                            className="whitespace-nowrap"
                          >
                            {item.account_type === "business"
                              ? t("userInfo.business")
                              : t("userInfo.individual")}
                          </CustomBadge>
                        )}
                        {item.client_details?.account_verified && (
                          <CustomBadge
                            variant={"rent"}
                            size="lg"
                            className="whitespace-nowrap"
                          >
                            {t("userInfo.verified")}
                          </CustomBadge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {loading && (
                <>
                  {[...Array(pagination.limit)].map((_, i) => (
                    <TableRow key={`loading-${i}`}>
                      <TableCell colSpan={6}>
                        <div className="flex items-center space-x-4 p-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
          {!hasMore && filteredItems.length > 0 && (
            <div className="p-4 text-center text-muted-foreground">
              {t("dashboard.messages.noMoreItems")}
            </div>
          )}
          {!loading && filteredItems.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              {t("dashboard.messages.noItemsFound")}
            </div>
          )}
        </div>
      </div>
      <ItemDetailView
        uuid={selectedItemUuid || ""}
        open={!!selectedItemUuid}
        onClose={() => setSelectedItemUuid(null)}
        onItemUpdate={handleItemUpdate}
      />
    </div>
  );
}
