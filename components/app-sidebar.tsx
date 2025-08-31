import * as React from "react";
import { Sidebar, SidebarContent, SidebarRail } from "@/components/ui/sidebar";
import { Chat } from "@/components/ai/Chat";
import { UIMessage } from "@ai-sdk/react";

export function AppSidebar({ onAssistantTurnEnd, ...props }: React.ComponentProps<typeof Sidebar> & {
  onAssistantTurnEnd?: (args: { messages: UIMessage[] }) => void;
}) {
  return (
    <Sidebar collapsible="none" className="bg-sidebar border-sidebar-border" {...props}>
      <SidebarContent className="p-0 bg-sidebar">
        <Chat onAssistantTurnEnd={onAssistantTurnEnd} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
