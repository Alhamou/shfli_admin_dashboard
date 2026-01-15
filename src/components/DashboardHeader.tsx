import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import storageController from "@/controllers/storageController"
import { Bell, BellOff, Menu } from "lucide-react"
import { useState } from "react"
import { ThemeToggle } from "./ThemeToggle"

export function DashboardHeader() {
  const [muted, setMuted] = useState(storageController.get('audio') === 'muted' ? true : false)

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 shadow-sm">
      {/* Sidebar trigger with better styling */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors duration-200 lg:hidden"
        asChild
      >
        <SidebarTrigger>
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
      </Button>

      <SidebarTrigger className="hidden lg:flex h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors duration-200" />

      <Separator orientation="vertical" className="h-6 bg-border/50" />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            muted ? storageController.set('audio', 'unmuted') : storageController.set('audio', 'muted')
            setMuted(!muted)
          }}
          className={`
            h-9 w-9 rounded-lg transition-all duration-200
            ${muted
              ? "hover:bg-destructive/10 hover:text-destructive"
              : "hover:bg-primary/10 hover:text-primary"
            }
          `}
        >
          {!muted
            ? <Bell className="h-4 w-4" />
            : <BellOff className="h-4 w-4 text-muted-foreground" />
          }
        </Button>
      </div>

      {/* Bottom gradient border effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </header>
  )
}
