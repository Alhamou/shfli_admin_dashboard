import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CustomBadge } from "@/components/ui/custom-badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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
import { Briefcase, Clock, Eye, Hash, LayoutGrid, MapPin, MoreHorizontal, Search, Tag, Users, Wifi, WifiOff, X } from "lucide-react";
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

  const handleFetchClick = () => {
    fetchItems(1, pagination.limit, searchTerm.trim(), uuidSearchTerm.trim());
  };

  useEffect(() => {
    fetchItems(pagination.page, pagination.limit);
  }, []);

  const handleItemUpdate = useCallback(
    (updatedItem: ICreatMainItem) => {
      setItems((prev) => updateItemInArray(prev, updatedItem));
      if (selectedItemUuid === updatedItem.uuid) {
        setSelectedItemUuid(null);
      }
    },
    [selectedItemUuid]
  );

  const handlePositionToggle = async (item: ICreatMainItem) => {
    const newPosition = item.position === 1 ? 0 : 1;
    try {
      await updateItem(item.uuid, { position: newPosition });
      setItems((prev) => prev.map(i => i.uuid === item.uuid ? { ...i, position: newPosition } : i));
      toast.success("تم تحديث الأولوية بنجاح");
    } catch (error) {
      toast.error("فشل تحديث الأولوية");
    }
  };

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchItems(
            pagination.page + 1,
            pagination.limit,
            searchTerm.trim(),
            uuidSearchTerm.trim()
          );
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, pagination.page, pagination.limit, searchTerm, uuidSearchTerm, fetchItems]);

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
    connectSocket();
    const onConnect = () => setIsSocketConnected(true);
    const onDisconnect = () => setIsSocketConnected(false);
    const onMessage = (message: ICreatMainItem) => {
      setItems((prev) => [message, ...prev]);
      if (storageController.get("audio") !== "muted") {
        playAudioWithWebAudio("/twinkle.mp3");
      }
    };
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message", onMessage);
    };
  }, []);

  const getStatusBadge = (status: string) => {
    let variant: any = "unknown";
    let label = "غير معروف";

    switch(status) {
        case 'active': variant = 'active'; label = 'نشط'; break;
        case 'pending': variant = 'pending'; label = 'معلق'; break;
        case 'blocked': variant = 'blocked'; label = 'محظور'; break;
        case 'ended': variant = 'archived'; label = 'منتهي'; break;
        case 'ask_edit': variant = 'reserved'; label = 'طلب تعديل'; break;
    }

    return (
      <CustomBadge variant={variant} size="lg" className="px-3 py-1 font-bold shadow-sm whitespace-nowrap">
        {label}
      </CustomBadge>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black tracking-tight text-foreground">قائمة العناصر</h1>
            <div className={`
                flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300
                ${isSocketConnected
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]"
                  : "bg-red-500/10 text-red-500 border border-red-500/20"
                }
              `}>
                <span className={`h-1.5 w-1.5 rounded-full ${isSocketConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                {isSocketConnected ? "مباشر" : "منقطع"}
            </div>
          </div>
          <p className="text-muted-foreground font-medium">
            لديك <span className="text-primary font-bold">{pagination.total}</span> إعلان متاح في النظام للمراجعة والإدارة.
          </p>
        </div>

        <div className="flex items-center gap-3">
            {/* Action buttons could go here */}
        </div>
      </div>

      {/* Advanced Filter Card */}
      <Card className="border-border/40 shadow-xl shadow-black/5 bg-card/50 backdrop-blur-sm overflow-hidden rounded-3xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-4">
            <div className="relative group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="ابحث بالاسم أو الرقم التعريفي للإعلان..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-14 pr-12 bg-background/50 border-transparent focus:bg-background focus:ring-4 focus:ring-primary/10 rounded-2xl transition-all font-medium"
                style={{ direction: "rtl" }}
              />
              {searchTerm && (
                <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground hover:text-destructive transition-colors" onClick={() => setSearchTerm("")}>
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
            <div className="relative group">
              <Users className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="ابحث بمعرف المستخدم أو الرقم..."
                value={uuidSearchTerm}
                onChange={(e) => setUuidSearchTerm(e.target.value)}
                className="h-14 pr-12 bg-background/50 border-transparent focus:bg-background focus:ring-4 focus:ring-primary/10 rounded-2xl transition-all font-medium"
                style={{ direction: "rtl" }}
              />
              {uuidSearchTerm && (
                <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground hover:text-destructive transition-colors" onClick={() => setUuidSearchTerm("")}>
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
            <Button onClick={handleFetchClick} disabled={loading} className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95 font-bold text-lg">
              {loading ? "جاري البحث..." : "تطبيق الفلتر"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Section: Cards for Mobile, Table for Desktop */}
      <div className="flex-1 min-h-0">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 pr-1">

          {/* Mobile Display: Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
            {items.map((item) => (
              <Card key={item.uuid} className="group hover:shadow-2xl transition-all duration-500 border-border/50 rounded-3xl overflow-hidden active:scale-[0.98]" onClick={() => setSelectedItemUuid(item.uuid)}>
                <div className="relative aspect-[16/10] overflow-hidden">
                  {item.item_as === 'job' && !(item.thumbnail || (item.images && item.images[0]?.url)) ? (
                    <div className="w-full h-full bg-blue-500/10 flex flex-col items-center justify-center gap-2">
                        <Briefcase className="h-12 w-12 text-blue-500/30" />
                        <span className="text-sm text-blue-500/40 font-black">إعلان وظيفة</span>
                    </div>
                  ) : (
                    <img
                      src={item.thumbnail || (item.images && item.images[0]?.url) || "/placeholder-item.png"}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute top-3 left-3 pointer-events-auto z-10">
                    {getStatusBadge(item.is_active)}
                  </div>
                  <div className="absolute bottom-3 right-3 left-3 flex justify-between items-end pointer-events-none">
                    <div className="bg-primary px-3 py-1.5 rounded-xl shadow-lg ring-1 ring-white/20 pointer-events-auto">
                        <p className="text-white font-black text-sm">
                            {formatPrice(item.discount ? getPriceDiscount(item.price, item.discount) : item.price, item?.currency)}
                        </p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-black text-lg truncate group-hover:text-primary transition-colors">{item.title}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-tight">
                        <Tag className="h-3 w-3" />
                        <span>{item.category_name?.ar}</span>
                        <span>•</span>
                        <span>{item.subcategory_name?.ar}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{item.city}, {item.state}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{moment(item.activated_at).locale("ar").fromNow()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{item.view_count || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Display: Modern Responsive Table */}
          <div className="hidden lg:block bg-card rounded-3xl border border-border/40 shadow-xl shadow-black/5 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="h-16 hover:bg-transparent border-border/40">
                  <TableHead className="w-16 pr-6 text-right"></TableHead>
                  <TableHead className="w-[280px] font-black uppercase text-xs tracking-widest text-right">العنصر</TableHead>
                  <TableHead className="font-black uppercase text-xs tracking-widest text-right">التصنيف</TableHead>
                  <TableHead className="font-black uppercase text-xs tracking-widest text-right">السعر والقيمة</TableHead>
                  <TableHead className="font-black uppercase text-xs tracking-widest text-right">الموقع الجغرافي</TableHead>
                  <TableHead className="font-black uppercase text-xs tracking-widest text-right">الإحصائيات</TableHead>
                  <TableHead className="font-black uppercase text-xs tracking-widest text-right">المستخدم</TableHead>
                  <TableHead className="font-black uppercase text-xs tracking-widest text-right pl-6">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.uuid}
                    className="group border-border/30 hover:bg-muted/30 transition-all cursor-pointer"
                    onClick={() => setSelectedItemUuid(item.uuid)}
                  >
                    <TableCell className="pr-6" onClick={(e) => e.stopPropagation()}>
                        <Switch
                             checked={item.position === 1}
                             onCheckedChange={() => handlePositionToggle(item)}
                         />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4 py-3">
                        <div className="h-20 w-20 flex-shrink-0 rounded-2xl overflow-hidden bg-muted flex items-center justify-center shadow-inner group-hover:shadow-md transition-all">
                          {item.item_as === 'job' && !(item.thumbnail || (item.images && item.images[0]?.url)) ? (
                            <div className="w-full h-full bg-blue-500/10 flex flex-col items-center justify-center gap-1">
                                <Briefcase className="h-8 w-8 text-blue-500/40" />
                                <span className="text-[10px] text-blue-500/50 font-black">وظيفة</span>
                            </div>
                          ) : (
                            <img
                              src={item.thumbnail || (item.images && item.images[0]?.url) || "/placeholder-item.png"}
                              alt={item.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              onError={(e) => (e.currentTarget.src = "/placeholder-item.png")}
                            />
                          )}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <p className="font-black text-foreground group-hover:text-indigo-600 group-hover:underline underline-offset-4 decoration-2 decoration-indigo-600/30 transition-all duration-300 truncate max-w-[250px]">{item.title}</p>
                          <p className="text-xs text-muted-foreground/80 line-clamp-1 font-medium max-w-[200px]">{item.description}</p>
                          <div className="flex items-center gap-2 pt-1">
                            {item.item_as === 'job' && <CustomBadge className="h-5 px-2 text-[10px] bg-blue-500/10 text-blue-500 border-none font-black">{item.need ? "باحث" : "موظِف"}</CustomBadge>}
                            {item.account_type === 'business' && <CustomBadge className="h-5 px-2 text-[10px] bg-primary/10 text-primary border-none font-black">عمل تجاري</CustomBadge>}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="space-y-1">
                         <div className="flex items-center gap-1.5 text-sm font-bold">
                            <Tag className="h-3.5 w-3.5 text-primary/60" />
                            <span>{item.category_name?.ar}</span>
                         </div>
                         <p className="text-xs text-muted-foreground font-medium">{item.subcategory_name?.ar}</p>
                       </div>
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex flex-col items-center bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                        <p className="font-black text-primary text-base tabular-nums">
                            {formatPrice(item.discount ? getPriceDiscount(item.price, item.discount) : item.price, item?.currency)}
                        </p>
                        {item.discount > 0 && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-md shadow-sm">وفر {item.discount}%</span>
                            <span className="text-[10px] text-muted-foreground line-through opacity-60 font-bold tabular-nums">{formatPrice(item.price, item?.currency)}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-1.5 text-sm font-bold">
                            <MapPin className="h-3.5 w-3.5 text-red-500/60" />
                            <span>{item.city}</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">{item.state}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex flex-col gap-2">
                           <div className="flex items-center gap-2 text-xs font-bold" title="المشاهدات">
                                <div className="h-6 w-6 rounded-md bg-blue-500/10 flex items-center justify-center">
                                    <Eye className="h-3.5 w-3.5 text-blue-600" />
                                </div>
                                <span>{item.view_count || 0} مشاهدة</span>
                           </div>
                           <div className="flex items-center gap-2 text-xs font-bold" title="التوقيت">
                                <div className="h-6 w-6 rounded-md bg-amber-500/10 flex items-center justify-center">
                                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                                </div>
                                <span>{moment(item.activated_at).locale("ar").fromNow(true)}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-mono">
                            <Hash className="h-3 w-3" />
                            <span>{item.uuid.substring(0, 8)}...</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border/50 ring-2 ring-primary/5">
                            <AvatarFallback className="bg-muted text-foreground text-[10px] font-black">
                                {item.client_details?.first_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate max-w-[120px]">
                                {(item.client_details?.first_name ?? "") + " " + (item.client_details?.last_name ?? "")}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-medium" style={{ direction: 'ltr' }}>{item.client_details?.phone_number}</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="text-left pl-6">
                       <div className="flex flex-col items-start gap-2">
                          {getStatusBadge(item.is_active)}
                          <div className="flex flex-wrap gap-1">
                            {item.client_details?.account_verified && <div className="h-4 w-4 rounded-full bg-blue-500 text-white flex items-center justify-center" title="موثق"><CheckCircleIcon className="h-3 w-3" /></div>}
                            {item.archived && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1 rounded">مؤرشف</span>}
                          </div>
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Loading Skeletons */}
          {loading && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="lg:hidden h-64 w-full bg-muted rounded-3xl animate-pulse" />
               ))}
               <div className="hidden lg:block h-[400px] w-full bg-muted/30 rounded-3xl animate-pulse" />
            </div>
          )}

          {/* Empty States */}
          {!loading && items.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center animate-in zoom-in-95 duration-500">
               <div className="h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                <X className="h-10 w-10 text-muted-foreground/30 font-black" />
               </div>
               <h3 className="text-2xl font-black text-foreground mb-2">لا توجد نتائج بحث</h3>
               <p className="text-muted-foreground max-w-xs mx-auto">لم نتمكن من العثور على أي عناصر تطابق معايير البحث الحالية.</p>
               <Button variant="outline" className="mt-8 rounded-xl font-bold" onClick={() => {setSearchTerm(""); setUuidSearchTerm(""); fetchItems(1, 25)}}>إعادة تعيين الكل</Button>
            </div>
          )}

          {!hasMore && items.length > 0 && (
              <div className="py-10 text-center text-muted-foreground font-bold text-sm">
                  لقد وصلت إلى نهاية القائمة ✨
              </div>
          )}

          {/* Observer Target */}
          <div ref={observerTarget} className="h-10 w-full flex items-center justify-center">
            {loading && items.length > 0 && (
              <div className="flex items-center gap-2 text-primary font-bold animate-pulse">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span>جاري تحميل المزيد...</span>
              </div>
            )}
          </div>
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

function CheckCircleIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )
  }
