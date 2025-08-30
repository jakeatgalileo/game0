import * as React from "react";
import { Sidebar, SidebarContent, SidebarRail } from "@/components/ui/sidebar";
import { Chat } from "@/components/ai/Chat";

export function AppSidebar({ onAssistantTurnEnd, ...props }: React.ComponentProps<typeof Sidebar> & {
  onAssistantTurnEnd?: (args: { messages: { id: string; role: string; content: string }[] }) => void;
}) {
  return (
    <Sidebar collapsible="none" className="bg-gray-900 border-gray-800" {...props}>
      <SidebarContent className="p-0 bg-gray-900">
        <Chat onAssistantTurnEnd={onAssistantTurnEnd} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
