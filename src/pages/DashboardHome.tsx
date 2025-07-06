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
import {
  isUUIDv4,
  playAudioWithWebAudio,
  toQueryString,
  updateItemInArray,
} from "@/lib/helpFunctions";
import { getAllItems } from "@/services/restApiServices";
import { ICreatMainItem } from "@/interfaces";
import { CustomBadge } from "@/components/ui/custom-badge";
import { Eye } from "lucide-react";
import { ItemDetailView } from "@/components/ViewItem";
import { connectSocket, socket } from "@/controllers/requestController";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import storageController from "@/controllers/storageController";
import { Button } from "@/components/ui/button";

const initialQuery = { page: 1, limit: 25, total: 0 };

export default function DashboardHome() {
  const { t } = useTranslation();
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
        {t(`dashboard.statusTypes.${status}`)}
      </CustomBadge>
    );
  };

  return (
    <div className="mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
          <div
            className={`w-3 h-3 rounded-full ${
              isSocketConnected ? "bg-green-500" : "bg-red-500"
            }`}
            title={
              isSocketConnected
                ? t("dashboard.socketConnected")
                : t("dashboard.socketDisconnected")
            }
          />
        </div>
      </div>

      <div className="rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Input
              placeholder={t("dashboard.searchPlaceholder")}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full"
            />
          </div>
          <div>
            <Input
              placeholder={t("dashboard.uuidSearchPlaceholder")}
              value={uuidSearchTerm}
              onChange={handleUuidSearchChange}
              className="w-full"
            />
          </div>
          <div>
            <Button onClick={handleFetchClick} disabled={loading}>
              {loading ? t("dashboard.loading") : t("dashboard.loadItems")}
            </Button>
          </div>
        </div>

        <div
          ref={tableContainerRef}
          className="rounded-md border overflow-auto"
          style={{ maxHeight: "calc(100vh - 200px)" }}
        >
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead>{t("dashboard.tableHeaders.item")}</TableHead>
                <TableHead>{t("dashboard.tableHeaders.category")}</TableHead>
                <TableHead>{t("dashboard.tableHeaders.price")}</TableHead>
                <TableHead>{t("dashboard.tableHeaders.location")}</TableHead>
                <TableHead>{t("dashboard.tableHeaders.stats")}</TableHead>
                <TableHead>{t("dashboard.tableHeaders.status")}</TableHead>
                <TableHead>{t("dashboard.tableHeaders.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={`${index}`}>
                  <TableCell className="flex items-center gap-4">
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
                        <p className="font-medium truncate">
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
                        {item.category_name?.en ||
                          t("dashboard.messages.notAvailable")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.subcategory_name?.en ||
                          t("dashboard.messages.notAvailable")}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.price ? (
                      <div className="space-y-1">
                        <p className="font-medium">
                          {item.price.toLocaleString()} {item.currency}
                        </p>
                        {item.discount > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {t("dashboard.messages.discount")}: {item.discount}%
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
                        {new Date(item.activated_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {t("dashboard.messages.user")}: <br /> {item.user_id}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        UUID : <br /> {item.uuid_client}
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
                          {item.account_type}
                        </CustomBadge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      className="text-sm text-primary hover:underline"
                      onClick={() => setSelectedItemUuid(item.uuid)}
                    >
                      {t("dashboard.messages.view")}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {loading && (
                <>
                  {[...Array(pagination.limit)].map((_, i) => (
                    <TableRow key={`loading-${i}`}>
                      <TableCell colSpan={8}>
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
          {!hasMore && items.length > 0 && (
            <div className="p-4 text-center text-muted-foreground">
              {t("dashboard.messages.noMoreItems")}
            </div>
          )}
          {!loading && items.length === 0 && (
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
