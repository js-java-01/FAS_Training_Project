import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";

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
    <Sidebar variant="inset">
      {/* Header */}
      <SidebarHeader className=" py-3 font-bold text-lg text-blue-800">RBAC System</SidebarHeader>

      {/* Content */}
      <SidebarContent>
        {navGroups.map((group) => (
          <NavMain key={group.id} title={group.name} items={group.items} />
        ))}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4 text-xs flex flex-row justify-between items-center text-muted-foreground">
        RBAC System v1.0
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
