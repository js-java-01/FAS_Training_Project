import { ChevronRight, type LucideIcon } from "lucide-react"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"

type NavItem = {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    items?: {
        title: string
        url: string
        isActive?: boolean
    }[]
}

export function NavMain({
    title,
    items,
}: {
    title: string
    items: NavItem[]
}) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>{title}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const hasChildren = !!item.items?.length

                    if (hasChildren) {
                        return (
                            <Collapsible
                                key={item.title}
                                asChild
                                defaultOpen={item.isActive}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            tooltip={item.title}
                                            isActive={item.isActive}
                                            className="data-[active=true]:bg-blue-800 data-[active=true]:text-white"
                                        >
                                            <item.icon className="h-4 w-4" />
                                            <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                                            <ChevronRight
                                                className="ml-auto transition-transform duration-200 group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-90"
                                            />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items?.map((subItem) => (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={subItem.isActive}
                                                        className="data-[active=true]:bg-blue-800 data-[active=true]:text-white"
                                                    >
                                                        <a href={subItem.url} className="flex items-center gap-2">
                                                            <span>{subItem.title}</span>
                                                        </a>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        )
                    }

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                isActive={item.isActive}
                                className="data-[active=true]:bg-blue-800 data-[active=true]:text-white"
                            >
                                <a href={item.url} className="flex items-center gap-2">
                                    <item.icon className="h-4 w-4" />
                                    <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
                })}
            </SidebarMenu>
        </SidebarGroup>
    )
}
