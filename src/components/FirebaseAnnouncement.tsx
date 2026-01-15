import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AnnouncementDialog({
  onSend,
  children,
}: {
  onSend: (data: { title: string; description: string }) => Promise<void>;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [errors, setErrors] = useState({
    title: false,
    description: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const validate = () => {
    const newErrors = {
      title: formData.title.trim() === "",
      description: formData.description.trim() === "",
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
      toast.success("تم إرسال الإعلان بنجاح");
      setFormData({ title: "", description: "" });
      setOpen(false);
    } catch (error) {
      toast.error("فشل في إرسال الإعلان");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="max-w-md rounded-2xl text-right"
        style={{ direction: "rtl" }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-purple-500" />
            إرسال إعلان عام للمستخدمين
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              عنوان الإعلان
            </label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`h-12 text-lg ${
                errors.title ? "border-red-500" : ""
              } text-right`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">
                هذا الحقل مطلوب
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              وصف الإعلان
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className={`text-lg ${
                errors.description ? "border-red-500" : ""
              } text-right`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                هذا الحقل مطلوب
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                جاري الإرسال...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Send className="h-5 w-5" />
                إرسال الآن
              </span>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
