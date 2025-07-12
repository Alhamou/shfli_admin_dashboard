import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function AnnouncementDialog({
  onSend,
}: {
  onSend: (data: { title: string; description: string }) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [errors, setErrors] = useState({
    title: false,
    description: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: false }));
  };

  const validate = () => {
    const newErrors = {
      title: formData.title.trim() === '',
      description: formData.description.trim() === '',
    };
    setErrors(newErrors);
    return !newErrors.title && !newErrors.description;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSend(formData);
      toast.success(t('announcement.success'));
      setFormData({ title: '', description: '' });
      setOpen(false);
    } catch (error) {
      toast.error(t('announcement.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 lg:flex-none">
          <Send className="mr-2 h-4 w-4" />
          {t('announcement.button')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('announcement.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              name="title"
              placeholder={t('announcement.titlePlaceholder')}
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">
                {t('announcement.requiredField')}
              </p>
            )}
          </div>
          <div>
            <Textarea
              name="description"
              placeholder={t('announcement.descriptionPlaceholder')}
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {t('announcement.requiredField')}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center">
               <Loader />
                {t('announcement.sending')}
              </span>
            ) : (
              <span className="flex items-center">
                <Send className="mr-2 h-4 w-4" />
                {t('announcement.send')}
              </span>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}