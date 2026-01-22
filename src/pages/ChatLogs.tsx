import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { getMessageContent } from "@/services/restApiServices";
import { AlertCircle, ArrowLeft, Clock, ExternalLink, Hash, MessageCircle, Search, Trash2, User } from "lucide-react";
import { useState } from "react";
import { UserDetailDialog } from "@/components/UserDetailDialog";
import { ItemDetailView } from "@/components/ViewItem";

export const ChatLogs = () => {
  const [uuid, setUuid] = useState("");
  const [chatData, setChatData] = useState<IMessageThread | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedItemUuid, setSelectedItemUuid] = useState<string | null>(null);

  const handleFetchMessages = async () => {
    if (!uuid.trim()) {
      setError("الرجاء إدخال UUID صالح للمحادثة");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getMessageContent(uuid);
      setChatData(data);
    } catch (error) {
      setError("لم يتم العثور على محادثة بهذا المعرف (UUID) أو أن البيانات غير متوفرة حالياً");
      console.error("Error fetching chat data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (isoString: Date) => {
    return new Date(isoString).toLocaleTimeString("en-GB", {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
  };

  const getParticipantName = (senderId: number) => {
    if (!chatData) return "—";
    return senderId === chatData.buyer_id ? "المشتري" : "البائع";
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
                        value={uuid}
                        onChange={(e) => {
                            setUuid(e.target.value);
                            setError(null);
                        }}
                        className="h-14 ps-12 pe-12 bg-background/50 border-transparent focus:bg-background focus:ring-4 focus:ring-primary/10 rounded-2xl transition-all font-mono text-sm leading-none"
                        style={{ direction: "ltr" }}
                    />
                    {uuid && (
                        <button
                            onClick={() => setUuid("")}
                            className="absolute inset-y-0 end-4 flex items-center text-muted-foreground hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <Button
                    onClick={handleFetchMessages}
                    disabled={isLoading}
                    className="h-14 px-8 rounded-2xl font-black text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                    {isLoading ? "جاري جلب السجلات..." : "عرض المحادثة"}
                </Button>
            </div>

            {error && (
                <div className="mt-4 animate-in slide-in-from-top-2">
                    <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-600 rounded-2xl py-3 px-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="font-bold text-sm leading-none">{error}</AlertDescription>
                        </div>
                    </Alert>
                </div>
            )}
        </CardContent>
      </Card>

      {/* Chat Display Section */}
      {chatData ? (
        <Card className="border-border/40 shadow-2xl shadow-black/5 bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2.5rem] border-t-0">
          <CardHeader className="p-8 pb-6 border-b border-border/40 bg-muted/30">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="flex -space-x-3 rtl:space-x-reverse">
                        <Avatar className="h-12 w-12 border-4 border-background shadow-lg ring-2 ring-blue-500/20">
                            <AvatarFallback className="bg-blue-600 text-white font-black">B</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-12 w-12 border-4 border-background shadow-lg ring-2 ring-emerald-500/20">
                            <AvatarFallback className="bg-emerald-600 text-white font-black">S</AvatarFallback>
                        </Avatar>
                    </div>
                    <div>
                        <CardTitle className="text-xl font-black">تفاصيل المحادثة</CardTitle>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 font-bold text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
                                <User className="h-3.5 w-3.5 text-blue-500" />
                                <UserDetailDialog 
                                    userId={chatData.buyer_id} 
                                    trigger={<span>المشتري: <span className="underline">{chatData.buyer_id}</span></span>} 
                                />
                            </div>
                            <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
                                <User className="h-3.5 w-3.5 text-emerald-500" />
                                <UserDetailDialog 
                                    userId={chatData.seller_id} 
                                    trigger={<span>البائع: <span className="underline">{chatData.seller_id}</span></span>} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    <Button
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                            if (chatData.main_items_uuid) {
                                setSelectedItemUuid(chatData.main_items_uuid);
                                setIsItemModalOpen(true);
                            }
                        }}
                        className="h-8 px-3 rounded-xl bg-primary/10 text-primary font-black text-[10px] flex items-center gap-1.5 border border-primary/20 hover:bg-primary/20 transition-all"
                    >
                        <ExternalLink className="h-3.5 w-3.5" /> فتح الإعلان
                    </Button>
                    <div className="px-3 py-1 rounded-full bg-muted text-muted-foreground font-black text-[10px] flex items-center gap-1.5 border border-border/40">
                        <Hash className="h-3 w-3" /> عنصر: {chatData.main_items_id}
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground italic flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-primary" /> آخر رسالة: {formatTimestamp(chatData.last_chat.sent_at)}
                    </div>
                </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="h-[500px] overflow-y-auto p-8 space-y-8 bg-dot-pattern">
                {chatData.content?.map((message, index) => {
                  const isBuyer = message.sender_id === chatData.buyer_id;
                  return (
                    <div
                        key={`${message.sent_at}-${index}`}
                        className={`flex flex-col ${isBuyer ? "items-start" : "items-end"} space-y-2 animate-in slide-in-from-bottom-5 duration-500 ease-out`}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className={`flex items-center gap-2 mb-1 px-2 ${isBuyer ? "" : "flex-row-reverse"}`}>
                            <UserDetailDialog 
                                userId={isBuyer ? chatData.buyer_id : chatData.seller_id}
                                trigger={
                                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                                        {isBuyer ? "المشتري" : "البائع"}
                                    </span>
                                }
                            />
                            <div className={`h-1.5 w-1.5 rounded-full ${isBuyer ? "bg-blue-500" : "bg-emerald-500"}`} />
                        </div>

                        <div className="relative group max-w-[85%] md:max-w-[70%]">
                            <div
                                className={`rounded-[1.5rem] px-5 py-3 shadow-sm transition-all duration-300 ${
                                    isBuyer
                                    ? "bg-blue-600 text-white rounded-tr-none shadow-blue-500/10 hover:shadow-blue-500/30"
                                    : "bg-white dark:bg-muted/80 text-foreground rounded-tl-none shadow-black/5 hover:shadow-black/10 border border-border/40"
                                }`}
                            >
                                <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                                    {message.chat}
                                </p>
                            </div>
                            <div
                                className={`flex items-center gap-2 mt-1.5 px-1 ${
                                    isBuyer ? "justify-start" : "justify-end text-right"
                                }`}
                            >
                                <span className="text-[9px] font-black text-muted-foreground opacity-70 italic tabular-nums">
                                    {formatTimestamp(message.sent_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                  );
                })}
             </div>
          </CardContent>
          <CardFooter className="p-6 bg-muted/30 border-t border-border/40 flex justify-between items-center">
            <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                <span className="flex items-center gap-1.5"><MessageCircle className="h-3 w-3" /> {chatData.content?.length || 0} رسالة</span>
                <span className="w-px h-3 bg-muted-foreground/30"></span>
                <span className="flex items-center gap-1.5"><Hash className="h-3 w-3" /> {chatData.uuid}</span>
            </div>
            <Button variant="ghost" size="sm" className="h-8 rounded-lg font-black text-[10px] flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors">
                <Trash2 className="h-3 w-3 text-red-500" /> أرشَفـة السجل
            </Button>
          </CardFooter>
        </Card>
      ) : (
        !isLoading && (
          <div className="py-32 flex flex-col items-center justify-center text-center animate-in fade-in duration-1000">
             <div className="h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center mb-6 text-muted-foreground/30 ring-8 ring-muted/20">
                <MessageCircle className="h-10 w-10" />
             </div>
             <h3 className="text-xl font-black text-foreground mb-2">لا يوجد سجل لعرضه</h3>
             <p className="text-sm font-bold text-muted-foreground max-w-xs leading-relaxed italic">
                قم بإدخال "UUID" المحادثة في حقل البحث أعلاه لاسترجاع سجل الرسائل الكامل.
             </p>
          </div>
        )
      )}

      {/* Bottom Info Section */}
      <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 flex items-start gap-5">
         <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 flex-shrink-0">
            <AlertCircle className="h-6 w-6" />
         </div>
         <div className="space-y-1">
            <h4 className="font-black text-foreground">معايير مراجعة الدردشة</h4>
            <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                يتم عرض السجلات لأغراض رقابية فقط. يرجى التأكد من اتباع سياسة الخصوصية عند التعامل مع بيانات المستخدمين. أي محاولة لاستغلال هذه البيانات خارج إطار العمل الإداري تعرض الحساب للمساءلة القانونية.
            </p>
         </div>
      </div>
      {/* Item Details Modal */}
      {selectedItemUuid && (
          <ItemDetailView
              uuid={selectedItemUuid}
              open={isItemModalOpen}
              onClose={() => setIsItemModalOpen(false)}
              onItemUpdate={() => handleFetchMessages()}
          />
      )}
    </div>
  );
};
