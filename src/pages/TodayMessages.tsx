import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { IMessageThread } from "@/interfaces";
import { getAllMessages, getMessageContent } from "@/services/restApiServices";
import {
    AlertCircle,
    ArrowRight,
    Briefcase,
    Clock,
    ExternalLink,
    Hash,
    Loader2,
    MessageCircle,
    RefreshCw,
    Search,
    Trash2,
    User,
    X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { UserDetailDialog } from "@/components/UserDetailDialog";
import { ItemDetailView } from "@/components/ViewItem";

// Default job icon placeholder
const DEFAULT_THUMBNAIL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'%3E%3Cpath d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z'/%3E%3C/svg%3E";

export const TodayMessages = () => {
    const [messages, setMessages] = useState<IMessageThread[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<IMessageThread | null>(null);
    const [chatData, setChatData] = useState<IMessageThread | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Search state
    const [searchUuid, setSearchUuid] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Fullscreen image state
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

    // Item details modal state
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [selectedItemUuid, setSelectedItemUuid] = useState<string | null>(null);

    // Fetch today's messages
    const fetchMessages = useCallback(async (pageNum: number = 1, append: boolean = false) => {
        if (pageNum === 1) {
            setIsLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const data = await getAllMessages(pageNum, 20);
            const newMessages = data?.result || [];

            if (append) {
                setMessages(prev => [...prev, ...newMessages]);
            } else {
                setMessages(newMessages);
            }

            setHasMore(newMessages.length >= 20);
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setIsLoading(false);
            setLoadingMore(false);
        }
    }, []);

    // Fetch conversation content
    const fetchConversation = useCallback(async (uuid: string) => {
        setIsChatLoading(true);
        try {
            const data = await getMessageContent(uuid);
            setChatData(data);
        } catch (error) {
            console.error("Error fetching conversation:", error);
            setChatData(null);
        } finally {
            setIsChatLoading(false);
        }
    }, []);

    // Search for message by UUID
    const handleSearch = async () => {
        if (!searchUuid.trim()) {
            setSearchError("الرجاء إدخال UUID صالح للمحادثة");
            return;
        }

        setSearchLoading(true);
        setSearchError(null);

        try {
            const data = await getMessageContent(searchUuid.trim());
            if (data) {
                setChatData(data);
                setSelectedMessage({
                    ...data,
                    main_items_uuid: data.main_items_uuid || "",
                } as IMessageThread);
            } else {
                setSearchError("لم يتم العثور على محادثة بهذا المعرف");
            }
        } catch (error) {
            setSearchError("لم يتم العثور على محادثة بهذا المعرف (UUID) أو أن البيانات غير متوفرة حالياً");
            console.error("Error searching chat:", error);
        } finally {
            setSearchLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    // Auto-scroll to bottom when chat messages change
    useEffect(() => {
        if (chatContainerRef.current && chatData?.content) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatData]);

    // Handle message selection
    const handleSelectMessage = (message: IMessageThread) => {
        setSelectedMessage(message);
        fetchConversation(message.uuid);
    };

    // Handle back button
    const handleBack = () => {
        setSelectedMessage(null);
        setChatData(null);
    };

    // Load more messages
    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchMessages(nextPage, true);
        }
    };

    // Format timestamp - show time if today, date if older
    const formatTime = (dateString: Date | string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        // If more than 24 hours, show the date
        if (diffHours > 24) {
            return date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }).replace(/\//g, ".");
        }

        // Otherwise show the time
        return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true });
    };

    // Get preview text
    const getPreviewText = (text?: string) => {
        if (!text) return "";
        const words = text.split(" ").slice(0, 8);
        return words.join(" ") + (text.split(" ").length > 8 ? "..." : "");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500" style={{ direction: "rtl" }}>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-inner">
                            <MessageCircle className="h-5 w-5" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-foreground">سجلات المحادثات</h1>
                    </div>
                    <p className="text-muted-foreground font-medium mr-13">مراقبة وتتبع سجلات الدردشة بين البائعين والمشترين</p>
                </div>
                <Button
                    onClick={() => { setPage(1); fetchMessages(1); }}
                    variant="outline"
                    className="gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    تحديث
                </Button>
            </div>

            {/* Search Bar Section */}
            <Card className="border-border/40 shadow-xl shadow-black/5 bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2rem]">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-y-0 start-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                <Search className="h-5 w-5" />
                            </div>
                            <Input
                                type="text"
                                placeholder="أدخل معرف المحادثة (UUID) هُنـا..."
                                value={searchUuid}
                                onChange={(e) => {
                                    setSearchUuid(e.target.value);
                                    setSearchError(null);
                                }}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="h-14 ps-12 pe-12 bg-background/50 border-transparent focus:bg-background focus:ring-4 focus:ring-primary/10 rounded-2xl transition-all font-mono text-sm leading-none"
                                style={{ direction: "ltr" }}
                            />
                            {searchUuid && (
                                <button
                                    onClick={() => setSearchUuid("")}
                                    className="absolute inset-y-0 end-4 flex items-center text-muted-foreground hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <Button
                            onClick={handleSearch}
                            disabled={searchLoading}
                            className="h-14 px-8 rounded-2xl font-black text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            {searchLoading ? "جاري البحث..." : "عرض المحادثة"}
                        </Button>
                    </div>

                    {searchError && (
                        <div className="mt-4 animate-in slide-in-from-top-2">
                            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-600 rounded-2xl py-3 px-4">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="font-bold text-sm leading-none">{searchError}</AlertDescription>
                                </div>
                            </Alert>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Main Content - Two Panel Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
                {/* Messages List Panel */}
                <Card className={`border-border/40 shadow-xl shadow-black/5 bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2rem] lg:col-span-1 ${selectedMessage ? 'hidden lg:block' : ''}`}>
                    <CardHeader className="p-4 border-b border-border/40 bg-muted/30">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-primary" />
                            المحادثات ({messages.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                    <MessageCircle className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-2">لا توجد رسائل اليوم</h3>
                                <p className="text-sm text-muted-foreground">لم يتم إرسال أي رسائل حتى الآن</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/40 max-h-[500px] overflow-y-auto">
                                {messages.map((message) => (
                                    <div
                                        key={message.uuid}
                                        onClick={() => handleSelectMessage(message)}
                                        className={`flex items-center gap-3 p-4 cursor-pointer transition-all hover:bg-primary/5 ${selectedMessage?.uuid === message.uuid ? "bg-primary/10 border-r-4 border-primary" : ""
                                            }`}
                                    >
                                        {/* Thumbnail */}
                                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                                            {message.item_as === "job" ? (
                                                <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                                    <Briefcase className="h-5 w-5 text-white" />
                                                </div>
                                            ) : (
                                                <img
                                                    src={message.thumbnail || DEFAULT_THUMBNAIL}
                                                    alt={message.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => (e.currentTarget.src = DEFAULT_THUMBNAIL)}
                                                />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-sm text-foreground truncate max-w-[150px]">
                                                    {message.title}
                                                </span>
                                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                                    {formatTime(message.sent_at)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {getPreviewText(message.last_chat?.chat)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                    {hasMore && messages.length > 0 && (
                        <CardFooter className="p-4 border-t border-border/40">
                            <Button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                variant="outline"
                                className="w-full"
                            >
                                {loadingMore ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "تحميل المزيد"
                                )}
                            </Button>
                        </CardFooter>
                    )}
                </Card>

                {/* Chat Panel */}
                <Card className={`border-border/40 shadow-xl shadow-black/5 bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2rem] lg:col-span-2 ${!selectedMessage ? 'hidden lg:flex lg:items-center lg:justify-center' : ''}`}>
                    {selectedMessage ? (
                        <div className="flex flex-col h-full w-full">
                            {/* Chat Header */}
                            <CardHeader className="p-4 border-b border-border/40 bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleBack}
                                        className="lg:hidden rounded-full"
                                    >
                                        <ArrowRight className="h-5 w-5" />
                                    </Button>

                                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                                        {selectedMessage.item_as === "job" ? (
                                            <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                                <Briefcase className="h-5 w-5 text-white" />
                                            </div>
                                        ) : (
                                            <img
                                                src={selectedMessage.thumbnail || DEFAULT_THUMBNAIL}
                                                alt={selectedMessage.title}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <CardTitle className="text-base font-bold">{selectedMessage.title}</CardTitle>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                            <div className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                                                <User className="h-3 w-3 text-blue-500" />
                                                <UserDetailDialog 
                                                    userId={chatData?.buyer_id || selectedMessage.buyer_id} 
                                                    trigger={<span>المشتري: <span className="underline">{chatData?.first_name_buyer || selectedMessage.first_name_buyer || "—"}</span></span>} 
                                                />
                                            </div>
                                            <span>•</span>
                                            <div className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                                                <User className="h-3 w-3 text-emerald-500" />
                                                <UserDetailDialog 
                                                    userId={chatData?.seller_id || selectedMessage.seller_id} 
                                                    trigger={<span>البائع: <span className="underline">{chatData?.first_name_seller || selectedMessage.first_name_seller || "—"}</span></span>} 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => {
                                            setSelectedItemUuid(selectedMessage.main_items_uuid);
                                            setIsItemModalOpen(true);
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        فتح الإعلان
                                    </Button>
                                </div>
                            </CardHeader>

                            {/* Chat Messages */}
                            <CardContent className="flex-1 p-0 overflow-hidden">
                                <div
                                    ref={chatContainerRef}
                                    className="h-[400px] overflow-y-auto p-4 space-y-4 bg-dot-pattern"
                                    style={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                                >
                                    {isChatLoading ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        </div>
                                    ) : !chatData?.content || chatData.content.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center">
                                            <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                            <p className="text-muted-foreground">لا توجد رسائل</p>
                                        </div>
                                    ) : (
                                        chatData.content.map((msg, index) => {
                                            const isBuyer = msg.sender_id === chatData.buyer_id;
                                            return (
                                                <div
                                                    key={`${msg.sent_at}-${index}`}
                                                    className={`flex flex-col ${isBuyer ? "items-start" : "items-end"}`}
                                                >
                                                    <div className={`flex items-center gap-2 mb-1 ${isBuyer ? "" : "flex-row-reverse"}`}>
                                                        <UserDetailDialog 
                                                            userId={isBuyer ? chatData.buyer_id : chatData.seller_id}
                                                            trigger={
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                                                                    {isBuyer ? "المشتري" : "البائع"}
                                                                </span>
                                                            }
                                                        />
                                                        <div className={`h-1.5 w-1.5 rounded-full ${isBuyer ? "bg-blue-500" : "bg-emerald-500"}`} />
                                                    </div>

                                                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isBuyer
                                                        ? "bg-blue-600 text-white rounded-tr-sm"
                                                        : "bg-white dark:bg-muted/80 text-foreground rounded-tl-sm border border-border/40 shadow-sm"
                                                        }`}>
                                                        {msg.image ? (
                                                            <img
                                                                src={msg.image}
                                                                alt="صورة"
                                                                className="max-w-[200px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                                onClick={() => setFullscreenImage(msg.image || null)}
                                                            />
                                                        ) : (
                                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.chat}</p>
                                                        )}
                                                    </div>

                                                    <div className={`flex items-center gap-1 mt-1 text-[10px] text-muted-foreground ${isBuyer ? "" : "flex-row-reverse"}`}>
                                                        <Clock className="h-3 w-3" />
                                                        {formatTime(msg.sent_at)}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </CardContent>

                            {/* Chat Footer */}
                            <CardFooter className="p-4 bg-muted/30 border-t border-border/40">
                                <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground w-full">
                                    <span className="flex items-center gap-1.5">
                                        <MessageCircle className="h-3.5 w-3.5" />
                                        {chatData?.content?.length || 0} رسالة
                                    </span>
                                    <span className="w-px h-4 bg-muted-foreground/30"></span>
                                    <span className="flex items-center gap-1.5 font-mono text-[10px]">
                                        <Hash className="h-3 w-3" />
                                        {selectedMessage.uuid}
                                    </span>
                                </div>
                            </CardFooter>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-4 ring-8 ring-muted/20">
                                <MessageCircle className="h-10 w-10 text-muted-foreground/30" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">اختر محادثة</h3>
                            <p className="text-sm text-muted-foreground max-w-xs">
                                قم باختيار محادثة من القائمة على اليمين لعرض تفاصيلها
                            </p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Fullscreen Image Modal */}
            {fullscreenImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-in fade-in duration-300"
                    onClick={() => setFullscreenImage(null)}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full"
                        onClick={() => setFullscreenImage(null)}
                    >
                        <X className="h-6 w-6" />
                    </Button>
                    <img
                        src={fullscreenImage}
                        alt="Full screen"
                        className="max-w-[90%] max-h-[90%] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                    />
                </div>
            )}

            {/* Item Details Modal */}
            {selectedItemUuid && (
                <ItemDetailView
                    uuid={selectedItemUuid}
                    open={isItemModalOpen}
                    onClose={() => setIsItemModalOpen(false)}
                    onItemUpdate={() => fetchMessages(page)}
                />
            )}
        </div>
    );
};

export default TodayMessages;
