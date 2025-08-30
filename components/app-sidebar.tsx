import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Thread } from "./assistant-ui/thread"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="none" className="bg-gray-900 border-gray-800" {...props}>
      <SidebarContent className="p-0 bg-gray-900">
        <Thread />
      </SidebarContent>
      
      <SidebarRail />
    </Sidebar>
  )
}
