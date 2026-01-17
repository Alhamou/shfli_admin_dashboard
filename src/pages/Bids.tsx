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
import { getAllItems, updateItem } from "@/services/restApiServices";
import { Briefcase, Clock, Eye, Gavel, Hash, LayoutGrid, List, MapPin, MoreHorizontal, Search, Tag, Users, X } from "lucide-react";
import "moment";
import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const initialQuery = { page: 1, limit: 25, total: 0 };

export default function BidsScreen() {
  const [items, setItems] = useState<ICreatMainItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(initialQuery);
  const [hasMore, setHasMore] = useState(true);
  const [selectedItemUuid, setSelectedItemUuid] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uuidSearchTerm, setUuidSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
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
          item_for: "bid",
          bid_status: activeTab,
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
    [loading, activeTab]
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setItems([]);
  };

  useEffect(() => {
    fetchItems(1, pagination.limit, searchTerm.trim(), uuidSearchTerm.trim());
  }, [activeTab]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleUuidSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUuidSearchTerm(e.target.value);
  };

  const handleFetchClick = () => {
    fetchItems(1, pagination.limit, searchTerm.trim(), uuidSearchTerm.trim());
  };


  const handleItemUpdate = useCallback(
    (updatedItem: ICreatMainItem) => {
      setItems((prev) => updateItemInArray(prev, updatedItem));
    },
    []
  );


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
    // Use default English locale for moment
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 shadow-inner">
                <Gavel className="h-5 w-5" />
             </div>
             <h1 className="text-2xl font-black tracking-tight text-foreground">إدارة المزادات</h1>
          </div>
          <p className="text-muted-foreground font-medium flex items-center gap-2 mr-13">
            <span className="inline-flex h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
            إجمالي المزادات: {pagination.total}
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

      {/* Filter & Tabs Section */}
      <Card className="border-border/40 shadow-xl shadow-black/5 bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2.5rem]">
        <CardContent className="p-6 space-y-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="h-14 w-full bg-muted/50 p-1 rounded-2xl border border-border/40">
              <TabsTrigger value="pending" className="flex-1 rounded-xl font-bold data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all">قيد الانتظار</TabsTrigger>
              <TabsTrigger value="active" className="flex-1 rounded-xl font-bold data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all">نشط</TabsTrigger>
              <TabsTrigger value="ended" className="flex-1 rounded-xl font-bold data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all">منتهي</TabsTrigger>
              <TabsTrigger value="ask_edit" className="flex-1 rounded-xl font-bold data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all">طلب تعديل</TabsTrigger>
              <TabsTrigger value="blocked" className="flex-1 rounded-xl font-bold data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all">محظور</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4">
             <div className="relative group">
               <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input
                 placeholder="ابحث بالاسم أو الرقم التعريفي..."
                 value={searchTerm}
                 onChange={handleSearchChange}
                 className="h-14 pr-12 bg-background/50 border-transparent focus:bg-background focus:ring-4 focus:ring-primary/10 rounded-2xl transition-all font-medium"
                 style={{ direction: "rtl" }}
                 onKeyDown={(e) => e.key === 'Enter' && handleFetchClick()}
               />
             </div>
             <div className="relative group">
               <Users className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input
                 placeholder="ابحث بمعرف المستخدم أو الرقم..."
                 value={uuidSearchTerm}
                 onChange={handleUuidSearchChange}
                 className="h-14 pr-12 bg-background/50 border-transparent focus:bg-background focus:ring-4 focus:ring-primary/10 rounded-2xl transition-all font-medium"
                 style={{ direction: "rtl" }}
                 onKeyDown={(e) => e.key === 'Enter' && handleFetchClick()}
               />
             </div>
             <Button onClick={handleFetchClick} className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
                تحديث النتائج
             </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      <div
        className="h-[calc(100vh-320px)] overflow-y-auto pr-2 -mr-2 custom-scrollbar"
      >
        <div className="space-y-6 pb-20">
            {/* Mobile View: Cards */}
            <div className="grid grid-cols-1 md:hidden gap-4">
              {items.map((item) => (
                <Card
                    key={item.uuid}
                    className="overflow-hidden border-border/40 shadow-lg shadow-black/5 hover:shadow-xl transition-all rounded-3xl group cursor-pointer"
                    onClick={() => setSelectedItemUuid(item.uuid)}
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    {item.item_as === 'job' && !(item.thumbnail || (item.images && item.images[0]?.url)) ? (
                      <div className="w-full h-full bg-purple-500/10 flex flex-col items-center justify-center gap-2">
                          <Briefcase className="h-12 w-12 text-purple-500/30" />
                          <span className="text-xs text-purple-500/40 font-black">إعلان وظيفة</span>
                      </div>
                    ) : (
                      <img
                        src={item.thumbnail || (item.images && item.images[0]?.url) || "/placeholder-item.png"}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                      {getStatusBadge(item.is_active)}
                      <CustomBadge variant="unknown" className="bg-black/40 backdrop-blur-md text-white border-white/10">{item.item_as === 'job' ? 'وظيفة' : 'إعلان'}</CustomBadge>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start gap-3">
                        <h3 className="font-black text-lg line-clamp-1 leading-tight flex-1">{item.title}</h3>
                        {item.price > 0 && (
                            <p className="font-black text-primary whitespace-nowrap">
                                {formatPrice(item.discount ? getPriceDiscount(item.price, item.discount) : item.price, item?.currency)}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs font-bold text-muted-foreground">
                        <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" /> {item.city}</div>
                        <div className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5 text-primary" /> {item.category_name?.ar}</div>
                        <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" /> {moment(item.activated_at).locale("en").fromNow()}</div>
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
                        <TableHead className="w-[280px] font-black uppercase tracking-widest text-[10px] text-muted-foreground mr-1 text-right">المزاد</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground text-right">التصنيف</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground text-right">السعر الحالي</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground text-right">الموقع</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground text-right">الناشر</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground text-right">الحالة</TableHead>
                        <TableHead className="w-[60px] text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow
                            key={item.uuid}
                            className="group hover:bg-primary/5 transition-all duration-300 border-border/30 h-28 cursor-pointer"
                            onClick={() => setSelectedItemUuid(item.uuid)}
                        >
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
                                <div className="absolute top-1 right-1 h-6 w-6 bg-purple-500 rounded-lg flex items-center justify-center text-white shadow-lg border-2 border-background z-10">
                                    <Gavel className="h-3 w-3" />
                                </div>
                              </div>
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-black text-base truncate tracking-tight max-w-[250px] group-hover:text-indigo-600 group-hover:underline underline-offset-4 decoration-2 decoration-indigo-600/30 transition-all duration-300">{item.title}</h4>
                                    <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">ID: {item.id}</span>
                                </div>
                                <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed h-8 max-w-[200px]">
                                  {item.description}
                                </p>
                                <div className="flex items-center gap-3">
                                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      {moment(item.activated_at).locale("en").fromNow()}
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
                            {item.price > 0 && (
                                <div className="flex flex-col items-center bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                                    <p className="font-black text-primary text-base tabular-nums">
                                    {formatPrice(item.discount ? getPriceDiscount(item.price, item.discount) : item.price, item?.currency)}
                                    </p>
                                </div>
                            )}
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
                items.map((item) => (
                  <Card
                    key={item.uuid}
                    className="overflow-hidden border-border/40 shadow-xl shadow-black/5 hover:shadow-2xl transition-all rounded-[2rem] group cursor-pointer border-t-0"
                    onClick={() => setSelectedItemUuid(item.uuid)}
                  >
                    <div className="relative h-64 overflow-hidden">
                        <img
                            src={item.thumbnail || (item.images && item.images[0]?.url) || "/placeholder-item.png"}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:via-black/40 transition-all duration-500"></div>


                        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                            {getStatusBadge(item.is_active)}
                            <CustomBadge variant="unknown" className="bg-black/40 backdrop-blur-md text-white border-white/10">مزاد</CustomBadge>
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
                                 {item.price > 0 && (
                                    <p className="text-2xl font-black text-primary drop-shadow-md">
                                        {formatPrice(item.discount ? getPriceDiscount(item.price, item.discount) : item.price, item?.currency)}
                                    </p>
                                 )}
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
                                    <span className="text-[10px] font-bold text-muted-foreground italic">{moment(item.activated_at).locale("en").fromNow()}</span>
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

            {!hasMore && items.length > 0 && (
              <div className="py-12 text-center animate-in fade-in duration-1000">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-muted/30 border border-border/40">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/30"></div>
                    <p className="text-sm font-black text-muted-foreground">لا توجد المزيد من المزادات</p>
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/30"></div>
                </div>
              </div>
            )}

            {/* Observer Target */}
            <div ref={observerTarget} className="h-10 w-full flex items-center justify-center mb-6">
              {loading && items.length > 0 && (
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
