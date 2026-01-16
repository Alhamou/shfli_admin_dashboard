import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, ShieldCheck, Users } from "lucide-react";

interface VerifyResultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  verifiedUsers: { id: number }[];
}

export function VerifyResultsDialog({
  isOpen,
  onClose,
  verifiedUsers,
}: VerifyResultsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-none bg-card/95 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden p-0" style={{ direction: 'rtl' }}>
        <div className="absolute top-0 right-0 left-0 h-32 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />

        <div className="p-8 relative">
          <DialogHeader className="items-center text-center space-y-4">
            <div className="h-20 w-20 rounded-[2rem] bg-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-inner relative">
                <ShieldCheck className="h-10 w-10" />
                <div className="absolute -bottom-1 -left-1 h-8 w-8 rounded-full bg-card flex items-center justify-center border-4 border-card">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-500/20" />
                </div>
            </div>
            <div>
                <DialogTitle className="text-2xl font-black tracking-tight text-foreground">اكتمل التوثيق بنجاح</DialogTitle>
                <DialogDescription className="text-base font-bold text-muted-foreground/70 mt-1">
                    تم توثيق {verifiedUsers.length} مستخدم جديد استوفوا المعايير
                </DialogDescription>
            </div>
          </DialogHeader>

          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between px-2">
                <span className="text-sm font-black text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    قائمة المعرفات الرقمية
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/10">
                    تحديث لحظي
                </span>
            </div>

            <ScrollArea className="h-[250px] w-full rounded-[1.5rem] border border-border/40 bg-muted/30 p-4">
              <div className="grid grid-cols-2 gap-3">
                {verifiedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40 shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-emerald-500/5 group"
                  >
                    <div className="h-2 w-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
                    <span className="text-sm font-black tabular-nums text-foreground/80">#{user.id}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter className="mt-8">
            <Button
                onClick={onClose}
                className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 font-black text-lg transition-all active:scale-95"
            >
              تم المتابعة
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
