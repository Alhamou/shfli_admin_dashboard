import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import storageController from "@/controllers/storageController"
import { Bell, BellOff } from "lucide-react"
import { useState } from "react"
import { ThemeToggle } from "./ThemeToggle"

export function DashboardHeader() {
  const [muted,setMuted] = useState(storageController.get('audio') === 'muted' ? true : false)
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <div className="flex-1 flex items-center gap-4">
      <ThemeToggle />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => {
          muted ? storageController.set('audio','unmuted') : storageController.set('audio','muted')
          setMuted(!muted)
        }}>
          {!muted ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4"/>}
        </Button>
      </div>
    </header>
  )
}
