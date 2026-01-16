import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomBadge } from "@/components/ui/custom-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemDetailView } from "@/components/ViewItem";
import { ICreatMainItem } from "@/interfaces";
import {
    formatPrice,
    getPriceDiscount,
    isUUIDv4,
    toQueryString,
    updateItemInArray,
} from "@/lib/helpFunctions";
import { getAllCommercialItems, updateItem } from "@/services/restApiServices";
import { Briefcase, Clock, Eye, Hash, LayoutGrid, List, MapPin, MoreHorizontal, ShoppingBag, Tag } from "lucide-react";
import "moment";
import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const initialQuery = { page: 1, limit: 25, total: 0 };

export default function Commercial() {
  const [items, setItems] = useState<ICreatMainItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(initialQuery);
  const [hasMore, setHasMore] = useState(true);
  const [selectedItemUuid, setSelectedItemUuid] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"items" | "jobs">("items");
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

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
      setItems((prev) => updateItemInArray(prev, updatedItem));
      if (selectedItemUuid === updatedItem.uuid) {
        setSelectedItemUuid(null);
      }
    },
    [selectedItemUuid]
  );

  const handlePositionToggle = async (item: ICreatMainItem) => {
    const newPosition = item.position === 1 ? 0 : 1;
    setItems(prev => prev.map(i => i.uuid === item.uuid ? { ...i, position: newPosition } : i));

    try {
      await updateItem(item.uuid, { position: newPosition });
      toast.success("تم تحديث حالة التمييز بنجاح");
    } catch (error) {
      setItems(prev => prev.map(i => i.uuid === item.uuid ? { ...i, position: item.position } : i));
      toast.error("فشل تحديث حالة التمييز");
    }
  };

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchItems(
            pagination.page + 1,
            pagination.limit
          );
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, pagination.page, pagination.limit, fetchItems]);

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
      <CustomBadge variant={status} size="lg" className="px-3 py-1 font-bold shadow-sm whitespace-nowrap">
        {status === "active" ? "نشط" : status === "pending" ? "معلق" : "محظور"}
      </CustomBadge>
    );
  };

  const filteredItems = items.filter((item) => {
    if (activeTab === "jobs") return item.item_as === "job";
    return item.item_as !== "job";
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-inner">
                <ShoppingBag className="h-5 w-5" />
             </div>
             <h1 className="text-2xl font-black tracking-tight text-foreground">الإعلانات التجارية</h1>
          </div>
          <p className="text-muted-foreground font-medium flex items-center gap-2 mr-13">
            <span className="inline-flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            إجمالي العناصر: {pagination.total}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-2xl border border-border/40">
           <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className={`rounded-xl px-4 font-bold transition-all ${viewMode === 'table' ? 'shadow-md bg-background' : 'text-muted-foreground'}`}
           >
              <List className="h-4 w-4 ml-2" /> جدول
           </Button>
           <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={`rounded-xl px-4 font-bold transition-all ${viewMode === 'grid' ? 'shadow-md bg-background' : 'text-muted-foreground'}`}
           >
              <LayoutGrid className="h-4 w-4 ml-2" /> بطاقات
           </Button>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="flex justify-start">
        <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "items" | "jobs")}
            className="w-full md:w-auto"
        >
            <TabsList className="h-12 bg-muted/50 p-1 rounded-xl border border-border/40 min-w-[300px]">
              <TabsTrigger value="items" className="flex-1 rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" /> العناصر
              </TabsTrigger>
              <TabsTrigger value="jobs" className="flex-1 rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> الوظائف
              </TabsTrigger>
            </TabsList>
        </Tabs>
      </div>

      {/* Main Content Area */}
      <div
        className="h-[calc(100vh-250px)] overflow-y-auto pr-2 -mr-2 custom-scrollbar"
      >
        <div className="space-y-6 pb-20">
            {/* Mobile View: Cards */}
            <div className="grid grid-cols-1 md:hidden gap-4">
              {filteredItems.map((item) => (
                <Card
                    key={item.uuid}
                    className="overflow-hidden border-border/40 shadow-lg shadow-black/5 hover:shadow-xl transition-all rounded-3xl group cursor-pointer"
                    onClick={() => setSelectedItemUuid(item.uuid)}
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    {item.item_as === 'job' && !(item.thumbnail || (item.images && item.images[0]?.url)) ? (
                      <div className="w-full h-full bg-blue-500/10 flex flex-col items-center justify-center gap-2">
                        <Briefcase className="h-12 w-12 text-blue-500/30" />
                        <span className="text-xs text-blue-500/40 font-black">إعلان وظيفة</span>
                      </div>
                    ) : (
                      <img
                        src={item.thumbnail || (item.images && item.images[0]?.url) || "/placeholder-item.png"}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}
                     <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <div
                         onClick={(e) => { e.stopPropagation(); handlePositionToggle(item); }}
                         className={`h-10 w-10 rounded-2xl backdrop-blur-md flex items-center justify-center transition-all shadow-lg border ${item.position === 1 ? 'bg-primary text-white border-primary/20' : 'bg-black/20 text-white border-white/20 hover:bg-black/40'}`}
                        >
                            <Tag className={`h-5 w-5 ${item.position === 1 ? 'fill-current' : ''}`} />
                        </div>
                    </div>
                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                      {getStatusBadge(item.is_active)}
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start gap-3">
                        <h3 className="font-black text-lg line-clamp-1 leading-tight flex-1">{item.title}</h3>
                        <p className="font-black text-primary whitespace-nowrap">
                            {formatPrice(item.discount ? getPriceDiscount(item.price, item.discount) : item.price, item?.currency)}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs font-bold text-muted-foreground">
                        <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" /> {item.city}</div>
                        <div className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5 text-primary" /> {item.category_name?.ar}</div>
                        <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" /> {moment(item.activated_at).locale("ar").fromNow()}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop View: Table or Grid */}
            <div className={`hidden md:block ${viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6' : ''}`}>
              {viewMode === 'table' ? (
                <div className="rounded-[2.5rem] border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/5">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="hover:bg-transparent border-border/40 h-16">
                        <TableHead className="w-[80px] text-center font-black uppercase tracking-widest text-[10px] text-muted-foreground">تميز</TableHead>
                        <TableHead className="min-w-[350px] font-black uppercase tracking-widest text-[10px] text-muted-foreground mr-1">{activeTab === 'jobs' ? 'الوظيفة' : 'العنصر'}</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground text-center">التصنيف</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground text-center">السعر</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground text-center">الموقع</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground text-center">الناشر</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground text-center">الحالة</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow
                            key={item.uuid}
                            className="group hover:bg-primary/5 transition-all duration-300 border-border/30 h-28 cursor-pointer"
                            onClick={() => setSelectedItemUuid(item.uuid)}
                        >
                          <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                             <div className="flex justify-center">
                                <label className="relative inline-flex items-center cursor-pointer group/toggle">
                                    <input
                                        type="checkbox"
                                        checked={item.position === 1}
                                        onChange={() => handlePositionToggle(item)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-muted-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary transition-colors"></div>
                                </label>
                             </div>
                          </TableCell>
                          <TableCell className="p-4">
                            <div className="flex items-center gap-5">
                              <div className="relative h-20 w-20 flex-shrink-0 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center bg-muted rounded-2xl overflow-hidden border border-border/20 shadow-lg">
                                {item.item_as === 'job' && !(item.thumbnail || (item.images && item.images[0]?.url)) ? (
                                  <div className="w-full h-full bg-blue-500/10 flex items-center justify-center">
                                    <Briefcase className="h-8 w-8 text-blue-500/30" />
                                  </div>
                                ) : (
                                  <img
                                    className="h-full w-full object-cover"
                                    src={item.thumbnail || (item.images && item.images[0]?.url) || "/placeholder-item.png"}
                                    alt={item.title}
                                  />
                                )}
                                <div className="absolute -top-1 -right-1 h-6 w-6 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-lg border-2 border-background">
                                    {activeTab === 'jobs' ? <Briefcase className="h-3 w-3" /> : <ShoppingBag className="h-3 w-3" />}
                                </div>
                              </div>
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-black text-base truncate tracking-tight">{item.title}</h4>
                                    <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">ID: {item.id}</span>
                                </div>
                                <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed h-8">
                                  {item.description}
                                </p>
                                <div className="flex items-center gap-3">
                                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      {moment(item.activated_at).locale("ar").fromNow()}
                                   </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="inline-flex flex-col items-center gap-1">
                                <span className="font-black text-sm">{item.category_name?.ar}</span>
                                <span className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 bg-muted rounded-full">{item.subcategory_name?.ar}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                                <p className="font-black text-primary text-base">
                                  {formatPrice(item.discount ? getPriceDiscount(item.price, item.discount) : item.price, item?.currency)}
                                </p>
                                {item.discount > 0 && (
                                  <CustomBadge className="bg-emerald-500 hover:bg-emerald-600 text-[10px] h-5 px-1.5 rounded-lg border-0">خصم {item.discount}%</CustomBadge>
                                )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col items-center gap-1 whitespace-nowrap">
                                <div className="flex items-center gap-1.5 font-bold text-sm">
                                    <MapPin className="h-3.5 w-3.5 text-primary" />
                                    {item.city}
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground italic">{item.state}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                             <div className="flex items-center gap-3 justify-center">
                                <div className="text-right">
                                    <p className="font-black text-sm leading-tight">{(item.client_details?.first_name ?? "") + " " + (item.client_details?.last_name ?? "")}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground tabular-nums" style={{ direction: 'ltr' }}>{item.client_details?.phone_number}</p>
                                </div>
                                <Avatar className="h-10 w-10 border-2 border-background shadow-md">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">
                                        {(item.client_details?.first_name?.charAt(0) ?? "") + (item.client_details?.last_name?.charAt(0) ?? "")}
                                    </AvatarFallback>
                                </Avatar>
                             </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(item.is_active)}
                          </TableCell>
                          <TableCell>
                             <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10">
                                   <MoreHorizontal className="h-5 w-5" />
                                </Button>
                             </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <Card
                    key={item.uuid}
                    className="overflow-hidden border-border/40 shadow-xl shadow-black/5 hover:shadow-2xl transition-all rounded-[2rem] group cursor-pointer border-t-0"
                    onClick={() => setSelectedItemUuid(item.uuid)}
                  >
                    <div className="relative h-64 overflow-hidden">
                        {item.item_as === 'job' && !(item.thumbnail || (item.images && item.images[0]?.url)) ? (
                          <div className="w-full h-full bg-blue-500/10 flex flex-col items-center justify-center gap-2">
                            <Briefcase className="h-16 w-16 text-blue-500/30" />
                            <span className="text-sm text-blue-500/40 font-black">إعلان وظيفة</span>
                          </div>
                        ) : (
                          <img
                              src={item.thumbnail || (item.images && item.images[0]?.url) || "/placeholder-item.png"}
                              alt={item.title}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:via-black/40 transition-all duration-500"></div>

                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                            <div
                                onClick={(e) => { e.stopPropagation(); handlePositionToggle(item); }}
                                className={`h-12 w-12 rounded-[1.2rem] backdrop-blur-md flex items-center justify-center transition-all shadow-2xl border-2 ${item.position === 1 ? 'bg-primary text-white border-primary/20 scale-110' : 'bg-black/20 text-white border-white/20 hover:bg-black/40 hover:scale-105'}`}
                            >
                                <Tag className={`h-6 w-6 ${item.position === 1 ? 'fill-current' : ''}`} />
                            </div>
                        </div>

                        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                            {getStatusBadge(item.is_active)}
                            <CustomBadge variant="unknown" className="bg-black/40 backdrop-blur-md text-white border-white/10">{activeTab === 'jobs' ? 'وظيفة تجارية' : 'إعلان تجاري'}</CustomBadge>
                        </div>

                        <div className="absolute bottom-4 right-4 left-4 flex justify-between items-end">
                             <div className="space-y-1">
                                <div className="flex items-center gap-2 text-white/70 text-[10px] font-black uppercase tracking-widest">
                                    <MapPin className="h-3 w-3" />
                                    {item.city}، {item.state}
                                </div>
                                <h3 className="text-xl font-black text-white leading-tight line-clamp-1">{item.title}</h3>
                             </div>
                             <div className="text-right">
                                <p className="text-2xl font-black text-primary drop-shadow-md">
                                    {formatPrice(item.discount ? getPriceDiscount(item.price, item.discount) : item.price, item?.currency)}
                                </p>
                             </div>
                        </div>
                    </div>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-muted-foreground line-clamp-2 leading-relaxed mb-6 h-10">
                            {item.description}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-border/40">
                             <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border-2 border-background shadow-md">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">
                                        {(item.client_details?.first_name?.charAt(0) ?? "") + (item.client_details?.last_name?.charAt(0) ?? "")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-right">
                                    <p className="font-black text-xs leading-none mb-1">{(item.client_details?.first_name ?? "") + " " + (item.client_details?.last_name ?? "")}</p>
                                    <span className="text-[10px] font-bold text-muted-foreground italic">{moment(item.activated_at).locale("ar").fromNow()}</span>
                                </div>
                             </div>
                             <div className="flex items-center gap-4 text-muted-foreground font-black text-[10px]">
                                <div className="flex items-center gap-1.5">
                                    <Eye className="h-4 w-4" />
                                    {item.view_count || 0}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Hash className="h-4 w-4" />
                                    {item.id}
                                </div>
                             </div>
                        </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination / Loading States */}
            {loading && (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6' : 'space-y-4'}>
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={`loading-${i}`} className={viewMode === 'grid' ? "h-[450px] rounded-[2rem]" : "h-28 w-full rounded-3xl"} />
                ))}
              </div>
            )}

            {!hasMore && filteredItems.length > 0 && (
              <div className="py-12 text-center animate-in fade-in duration-1000">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-muted/30 border border-border/40">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/30"></div>
                    <p className="text-sm font-black text-muted-foreground">لا توجد المزيد من الإعلانات</p>
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/30"></div>
                </div>
              </div>
            )}

            {!loading && filteredItems.length === 0 && (
              <div className="py-32 text-center flex flex-col items-center animate-in zoom-in-95 duration-500">
                <div className="h-24 w-24 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 shadow-shadow text-blue-600">
                   <ShoppingBag className="h-10 w-10 animate-bounce" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-3">لا توجد عناصر تجارية</h3>
                <p className="text-muted-foreground max-w-sm font-medium leading-relaxed">
                  لم يتم العثور على أي عناصر تجارية في هذا القسم حالياً.
                </p>
              </div>
            )}

            {/* Observer Target */}
            <div ref={observerTarget} className="h-10 w-full flex items-center justify-center mb-6">
              {loading && filteredItems.length > 0 && (
                <div className="flex items-center gap-2 text-primary font-bold animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>جاري تحميل المزيد...</span>
                </div>
              )}
            </div>
        </div>
      </div>

      {/* Item Detail View */}
      <ItemDetailView
        uuid={selectedItemUuid || ""}
        open={!!selectedItemUuid}
        onClose={() => setSelectedItemUuid(null)}
        onItemUpdate={handleItemUpdate}
      />
    </div>
  );
}
