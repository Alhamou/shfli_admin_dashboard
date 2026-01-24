import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import storageController from "@/controllers/storageController"
import { Bell, BellOff, Menu, Search } from "lucide-react"
import { useState } from "react"
import { ThemeToggle } from "./ThemeToggle"
import { Input } from "./ui/input"

export function DashboardHeader() {
  const [muted, setMuted] = useState(storageController.get('audio') === 'muted' ? true : false)

  return (
    <header className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-4 bg-gradient-to-l from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 backdrop-blur-xl px-6 transition-all duration-300 border-b border-indigo-100 dark:border-slate-800 shadow-sm">
      {/* Mobile Sidebar Trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-xl hover:bg-primary/5 hover:text-primary transition-all duration-200 lg:hidden"
        asChild
      >
        <SidebarTrigger>
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
      </Button>

      {/* Desktop Sidebar Trigger */}
      <div className="hidden lg:flex items-center gap-4">
        <SidebarTrigger className="h-10 w-10 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 transition-all duration-200 shadow-sm border border-indigo-200" />
        <Separator orientation="vertical" className="h-8 bg-border/50" />
      </div>

      {/* Modern Search Bar (Global) - Scalable for future */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative group">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="البحث السريع..."
            className="h-10 pr-10 bg-white dark:bg-slate-800 border-indigo-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-indigo-500/30 rounded-xl transition-all shadow-sm"
            style={{ direction: 'rtl' }}
          />
        </div>
      </div>

      <div className="flex-1 md:hidden" />

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-indigo-50 dark:bg-slate-800 p-1 rounded-2xl border border-indigo-200 dark:border-slate-700 shadow-sm">
          <ThemeToggle />

          <Separator orientation="vertical" className="h-6 bg-border/50 mx-1" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const newState = !muted
              storageController.set('audio', newState ? 'muted' : 'unmuted')
              setMuted(newState)
            }}
            className={`
              h-9 w-9 rounded-xl transition-all duration-300
              ${muted
                ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                : "text-primary hover:bg-primary/10"
              }
            `}
          >
            {!muted
              ? <Bell className="h-4.5 w-4.5" />
              : <BellOff className="h-4.5 w-4.5" />
            }
          </Button>
        </div>
      </div>
    </header>
  )
}
