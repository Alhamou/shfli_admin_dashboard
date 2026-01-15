import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { IMessageThread } from "@/interfaces";
import { getChatLogs } from "@/services/restApiServices";
import { AlertCircle, XIcon } from "lucide-react";
import { useState } from "react";

export const ChatLogs = () => {
  const [uuid, setUuid] = useState("");
  const [chatData, setChatData] = useState<IMessageThread | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchMessages = async () => {
    if (!uuid.trim()) {
      setError("الرجاء إدخال UUID صالح");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getChatLogs(uuid);
      setChatData(data);
    } catch (error) {
      setError("UUID غير صالح أو المحادثة غير موجودة");
      console.error("Error fetching chat data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (isoString: Date) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getParticipantName = (senderId: number) => {
    if (!chatData) return "غير معروف";
    return senderId === chatData.buyer_id ? "المشتري" : "البائع";
  };

  return (
    <div
      className="container mx-auto p-4 max-w-4xl"
      style={{ direction: "rtl" }}
    >
      <h1 className="text-2xl font-bold mb-6">رسائل الدردشة</h1>

      <div className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="أدخل UUID المحادثة"
            value={uuid}
            onChange={(e) => {
              setUuid(e.target.value);
              setError(null); // Clear error when typing
            }}
            className="flex-1"
            style={{ direction: "ltr" }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute start-1 -top-[-5px] h-7 w-7 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            onClick={() => {
              setUuid("");
            }}
          >
            <XIcon className="h-4 w-4" color="red" />
            <span className="sr-only">Clear</span>
          </Button>
        </div>
        <Button onClick={handleFetchMessages} disabled={isLoading}>
          {isLoading ? "جار التحميل..." : "الحصول على الرسائل"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {chatData ? (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">محادثة الدردشة</h2>
            <p className="text-sm text-muted-foreground">
              بين المشتري (ID: {chatData.buyer_id}){" "}
              والبائع (ID: {chatData.seller_id})
            </p>
            <p className="text-sm text-muted-foreground">
              معرف العنصر: {chatData.main_items_id} |{" "}
              آخر رسالة:{" "}
              {formatTimestamp(chatData.last_chat.sent_at)}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {chatData.content?.map((message, index) => (
              <div
                key={`${message.sent_at}-${index}`}
                className={`flex ${
                  message.sender_id === chatData.buyer_id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                    message.sender_id === chatData.buyer_id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="font-medium">
                    {getParticipantName(message.sender_id)}
                  </div>
                  <p
                    className={
                      message.sender_id === chatData.buyer_id
                        ? "text-right"
                        : "text-left"
                    }
                  >
                    {message.chat}
                  </p>
                  <div
                    className={`text-xs mt-1 ${
                      message.sender_id === chatData.buyer_id
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formatTimestamp(message.sent_at)}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            {chatData.content?.length} رسائل |{" "}
            UUID المحادثة: {chatData.uuid}
          </CardFooter>
        </Card>
      ) : (
        !isLoading &&
        !error && (
          <div className="text-center py-8 text-muted-foreground">
            لم يتم تحديد الدردشة
          </div>
        )
      )}
    </div>
  );
};
