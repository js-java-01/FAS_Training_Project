import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarTrigger } from "@/components/ui/sidebar";

import { NavMain } from "@/components/layout/NavMain";
import { useSidebarMenus } from "@/hooks/useSidebarMenus";

import { TooltipWrapper } from "@/components/TooltipWrapper";
import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";

// import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api/authApi";

export function SidebarMenu() {
  const { navGroups } = useSidebarMenus();
  const navigate = useNavigate();
  return (
    <Sidebar variant="inset" collapsible="icon">
      {/* Header */}
      <SidebarHeader className="py-3">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden px-2 group-data-[collapsible=icon]:justify-center">
          <SidebarTrigger className="size-8" />
          <div className="flex min-w-0 items-center gap-2 transition-[opacity,transform] duration-150 group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:-translate-x-2 group-data-[collapsible=icon]:opacity-0">
            <div className="flex size-8 items-center justify-center rounded-md bg-blue-800 text-sm font-semibold text-white">
              RB
            </div>
            <span className="text-lg font-bold text-blue-800 whitespace-nowrap truncate">RBAC System</span>
          </div>
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        {navGroups.map((group) =>
          group ? (
            <NavMain key={group.id} title={group.name} items={group.items} />
          ) : null
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4 text-xs flex flex-row items-center justify-between text-muted-foreground group-data-[collapsible=icon]:justify-center">
        <span className="group-data-[collapsible=icon]:hidden">RBAC System v1.0</span>
        <TooltipWrapper content="Logout">
          <Button
            size="icon"
            variant="ghost"
            onClick={async () => {
              await authApi.logout();
              navigate("/login");
            }}
          >
            <LogOutIcon className="size-4" />
          </Button>
        </TooltipWrapper>
      </SidebarFooter>
    </Sidebar>
  );
}
