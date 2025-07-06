import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { getChatLogs } from '@/services/restApiServices';
import { IMessageThread } from '@/interfaces';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const ChatLogs = () => {
  const { t, i18n } = useTranslation();
  const [uuid, setUuid] = useState('');
  const [chatData, setChatData] = useState<IMessageThread | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchMessages = async () => {
    if (!uuid.trim()) {
      setError(t('errors.emptyUUID'));
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getChatLogs(uuid);
      setChatData(data);
    } catch (error) {
      setError(t('errors.invalidUUID'));
      console.error('Error fetching chat data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (isoString: Date) => {
    return new Date(isoString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const getParticipantName = (senderId: number) => {
    if (!chatData) return t('chat.unknown');
    return senderId === chatData.buyer_id ? t('chat.buyer') : t('chat.seller');
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl" style={{ direction: i18n.language === 'ar' ? 'rtl' : 'ltr' }}>
      <h1 className="text-2xl font-bold mb-6">{t('chat.title')}</h1>
      
      <div className="flex gap-2 mb-6">
        <Input
          type="text"
          placeholder={t('chat.uuidPlaceholder')}
          value={uuid}
          onChange={(e) => {
            setUuid(e.target.value);
            setError(null); // Clear error when typing
          }}
          className="flex-1"
          style={{direction : 'ltr'}}
        />
        <Button onClick={handleFetchMessages} disabled={isLoading}>
          {isLoading ? t('chat.loading') : t('chat.getMessages')}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {chatData ? (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">{t('chat.conversation')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('chat.betweenBuyer')} (ID: {chatData.buyer_id}) {t('chat.andSeller')} (ID: {chatData.seller_id})
            </p>
            <p className="text-sm text-muted-foreground">
              {t('chat.itemId')}: {chatData.main_items_id} | {t('chat.lastMessage')}: {formatTimestamp(chatData.last_chat.sent_at)}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {chatData.content?.map((message, index) => (
              <div
                key={`${message.sent_at}-${index}`}
                className={`flex ${message.sender_id === chatData.buyer_id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${message.sender_id === chatData.buyer_id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'}`}
                >
                  <div className="font-medium">{getParticipantName(message.sender_id)}</div>
                  <p className={message.sender_id === chatData.buyer_id ? 'text-right' : 'text-left'}>
                    {message.chat}
                  </p>
                  <div className={`text-xs mt-1 ${message.sender_id === chatData.buyer_id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {formatTimestamp(message.sent_at)}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            {chatData.content?.length} {t('chat.messageCount')} | {t('chat.uuid')}: {chatData.uuid}
          </CardFooter>
        </Card>
      ) : (
        !isLoading && !error && (
          <div className="text-center py-8 text-muted-foreground">
            {t('chat.noChatSelected')}
          </div>
        )
      )}
    </div>
  );
};