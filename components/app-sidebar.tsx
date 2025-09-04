import * as React from "react";
import { Sidebar, SidebarContent, SidebarRail } from "@/components/ui/sidebar";
import { Chat } from "@/components/ai/Chat";
import { UIMessage } from "@ai-sdk/react";

export function AppSidebar({ onAssistantTurnEnd, ...props }: React.ComponentProps<typeof Sidebar> & {
  onAssistantTurnEnd?: (args: { messages: UIMessage[] }) => void;
}) {
  return (
    <Sidebar collapsible="none" className="bg-background border-sidebar-border" {...props}>
      <SidebarContent className="p-0 bg-background overflow-hidden">
        <Chat onAssistantTurnEnd={onAssistantTurnEnd} className="py-4" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
