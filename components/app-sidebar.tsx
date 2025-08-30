import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Thread } from "./assistant-ui/thread"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="none" {...props}>
      <SidebarContent className="p-0">
        <Thread />
      </SidebarContent>
      
      <SidebarRail />
    </Sidebar>
  )
}
