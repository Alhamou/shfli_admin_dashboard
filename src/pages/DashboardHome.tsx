import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CustomBadge } from "@/components/ui/custom-badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ItemDetailView } from "@/components/ViewItem";
import { connectSocket, socket } from "@/controllers/requestController";
import storageController from "@/controllers/storageController";
import { ICreatMainItem } from "@/interfaces";
import {
    formatPrice,
    getPriceDiscount,
    isUUIDv4,
    playAudioWithWebAudio,
    toQueryString,
    updateItemInArray,
} from "@/lib/helpFunctions";
import { getAllItems, updateItem } from "@/services/restApiServices";
import { Eye, LayoutGrid, Search, Wifi, WifiOff, X } from "lucide-react";
import "moment";
import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const initialQuery = { page: 1, limit: 25, total: 0 };

export default function DashboardHome() {
  const [items, setItems] = useState<ICreatMainItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(initialQuery);
  const [hasMore, setHasMore] = useState(true);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [selectedItemUuid, setSelectedItemUuid] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uuidSearchTerm, setUuidSearchTerm] = useState("");
  const [isSocketConnected, setIsSocketConnected] = useState(false);

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
        const response = await getAllItems(query);
        console.log(response.result);
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
    [loading]
  );
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleUuidSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUuidSearchTerm(e.target.value);
  };

  const handleFetchClick = () => {
    fetchItems(1, pagination.limit, searchTerm.trim(), uuidSearchTerm.trim());
  };

  // Initial fetch
  useEffect(() => {
    fetchItems(pagination.page, pagination.limit);
  }, []);

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
      fetchItems(
        pagination.page,
        pagination.limit,
        searchTerm.trim(),
        uuidSearchTerm.trim()
      );
      toast.success("تم تحديث العنصر بنجاح");
    } catch (error) {
      toast.error("فشل تحديث العنصر");
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
        fetchItems(
          pagination.page + 1,
          pagination.limit,
          searchTerm.trim(),
          uuidSearchTerm.trim()
        );
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, pagination, fetchItems, searchTerm, uuidSearchTerm]);

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

  useEffect(() => {
    // Connect with error handling
    connectSocket();

    // Debug events
    const onConnect = () => {
      console.log("Connected socket");
      setIsSocketConnected(true);
    };

    const onDisconnect = () => {
      console.log("Socket disconnected");
      setIsSocketConnected(false);
    };

    const onError = (err: Error) => {
      console.error("Socket error:", err.message);
      setIsSocketConnected(false);
    };

    const onMessage = (message: ICreatMainItem) => {
      console.log("new item received", message);
      setItems((prev) => [message, ...prev]);
      const muted = storageController.get("audio");
      if (muted && muted === "muted") {
      } else {
        playAudioWithWebAudio("/twinkle.mp3");
      }
    };

    // Connection check interval
    const checkConnectionInterval = setInterval(() => {
      if (!socket.connected) {
        console.log("Socket disconnected, attempting to reconnect...");
        socket.connect();
      }
    }, 5000); // Check every 5 seconds

    // Setup event listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onError);
    socket.on("message", onMessage);

    return () => {
      // Cleanup
      clearInterval(checkConnectionInterval);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onError);
      socket.off("message", onMessage);
      socket.disconnect();
    };
  }, []);

  const getStatusBadge = (status: "active" | "pending" | "blocked") => {
    return (
      <CustomBadge variant={status} size="lg" className="whitespace-nowrap">
        {status === "active" ? "نشط" : status === "pending" ? "معلق" : "محظور"}
      </CustomBadge>
    );
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
            <LayoutGrid className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">إدارة العناصر</h1>
            <p className="text-sm text-muted-foreground">
              {pagination.total} عنصر في النظام
            </p>
          </div>
        </div>

        {/* Connection Status */}
        <div className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300
          ${isSocketConnected
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }
        `}>
          {isSocketConnected ? (
            <>
              <Wifi className="h-4 w-4" />
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              متصل
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              غير متصل
            </>
          )}
        </div>
      </div>

      {/* Search Section */}
      <Card className="shadow-sm border-border/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن العناصر..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pr-10 bg-background border-border/50 focus:border-primary transition-colors"
                style={{ direction: "ltr" }}
              />
              {searchTerm && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث حسب المستخدم..."
                value={uuidSearchTerm}
                onChange={handleUuidSearchChange}
                className="pr-10 bg-background border-border/50 focus:border-primary transition-colors"
                style={{ direction: "ltr" }}
              />
              {uuidSearchTerm && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setUuidSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              onClick={handleFetchClick}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 shadow-sm"
            >
              {loading ? "تحميل..." : "بحث"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="flex-1 flex flex-col shadow-sm border-border/50 overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-border/50 bg-muted/30">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-0">
                <TableHead className="text-start font-semibold text-foreground/80 w-16">مميز</TableHead>
                <TableHead className="text-start font-semibold text-foreground/80">العنصر</TableHead>
                <TableHead className="text-start font-semibold text-foreground/80">الفئة</TableHead>
                <TableHead className="text-start font-semibold text-foreground/80">السعر</TableHead>
                <TableHead className="text-start font-semibold text-foreground/80">الموقع</TableHead>
                <TableHead className="text-start font-semibold text-foreground/80">الإحصائيات</TableHead>
                <TableHead className="text-start font-semibold text-foreground/80">الحالة</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </CardHeader>

        <CardContent
          className="flex-1 overflow-auto p-0"
          ref={tableContainerRef}
          style={{ maxHeight: "calc(100vh - 340px)" }}
        >
          <Table>
            <TableBody>
              {items.map((item, index) => {
                const activated_at = moment(item.activated_at)
                  .locale("ar")
                  .fromNow();
                return (
                  <TableRow
                    key={`${index}`}
                    className="group hover:bg-muted/50 transition-colors duration-150 border-b border-border/30"
                  >
                    <TableCell className="w-16">
                      <input
                        type="checkbox"
                        checked={item.position === 1}
                        onChange={() => handlePositionToggle(item)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </TableCell>
                    <TableCell
                      className="flex items-center gap-4 cursor-pointer py-4"
                      onClick={() => setSelectedItemUuid(item.uuid)}
                    >
                      {item.item_as === "job" ? (
                        <Avatar className="h-12 w-12 border-2 border-primary/10 shadow-sm">
                          <AvatarImage
                            src={
                              item.thumbnail ||
                              (item.images && item.images[0]?.url)
                            }
                            alt={item.title}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {item.title.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="relative h-24 w-24 flex-shrink-0 rounded-xl overflow-hidden shadow-sm border border-border/50 group-hover:shadow-md transition-shadow">
                          <img
                            className="h-full w-full object-cover"
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
                      <div className="space-y-1 flex-1 min-w-0 max-w-48">
                        {item.item_as === "job" && (
                          <p className="text-xs font-medium text-primary">
                            {item.need ? "يبحث عن عمل" : "تبحث عن موظف"}
                          </p>
                        )}
                        <p className="font-semibold truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </p>
                        <p className={`text-sm text-muted-foreground ${
                          item.item_as === "job" ? "line-clamp-3" : "line-clamp-2"
                        }`}>
                          {item.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-medium text-sm">
                          {item.category_name?.ar || "غير متوفر"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.subcategory_name?.ar || "غير متوفر"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.price ? (
                        <div className="space-y-0.5">
                          <p className="font-semibold text-sm">
                            {formatPrice(
                              item.discount
                                ? getPriceDiscount(item.price, item.discount)
                                : item.price,
                              item?.currency
                            )}
                          </p>
                          {item.discount > 0 && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                              خصم: {item.discount}%
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">غير متوفر</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-medium text-sm">{item.city}</p>
                        <p className="text-xs text-muted-foreground">{item.state}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{item.view_count || 0}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {activated_at.replace(/^منذ\s*/, "").replace(/\s*ago$/, "")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {item.user_id}
                        </p>
                        <p
                          className="text-xs text-muted-foreground"
                          style={{ direction: "ltr" }}
                        >
                          {item.client_details?.phone_number}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {(item.client_details?.first_name ?? "") +
                            " " +
                            (item.client_details?.last_name ?? "")}
                        </p>
                        {item.client_details?.account_type === "business" &&
                          item.client_details?.business_name && (
                            <p className="text-xs text-primary/80 truncate font-medium">
                              {item.client_details?.business_name}
                            </p>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        {getStatusBadge(item.is_active)}
                        {item.account_type && (
                          <CustomBadge
                            variant={"unknown"}
                            size="lg"
                            className="whitespace-nowrap"
                          >
                            {item.account_type === "business" ? "عمل" : "فرد"}
                          </CustomBadge>
                        )}
                        {item.client_details?.account_verified && (
                          <CustomBadge
                            variant={"rent"}
                            size="lg"
                            className="whitespace-nowrap"
                          >
                            موثق
                          </CustomBadge>
                        )}
                        {item.archived && (
                          <CustomBadge
                            variant="archived"
                            size="lg"
                            className="whitespace-nowrap"
                          >
                            مؤرشف
                          </CustomBadge>
                        )}
                        {item.reserved && (
                          <CustomBadge
                            variant="reserved"
                            size="lg"
                            className="whitespace-nowrap"
                          >
                            محجوز
                          </CustomBadge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {loading && (
                <>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={`loading-${i}`}>
                      <TableCell colSpan={7}>
                        <div className="flex items-center gap-4 p-3">
                          <Skeleton className="h-24 w-24 rounded-xl" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
          {!hasMore && items.length > 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground border-t border-border/30">
              لا توجد عناصر أخرى
            </div>
          )}
          {!loading && items.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <LayoutGrid className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">لم يتم العثور على عناصر</p>
              <p className="text-sm">جرب البحث بكلمات مختلفة</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ItemDetailView
        uuid={selectedItemUuid || ""}
        open={!!selectedItemUuid}
        onClose={() => setSelectedItemUuid(null)}
        onItemUpdate={handleItemUpdate}
      />
    </div>
  );
}
