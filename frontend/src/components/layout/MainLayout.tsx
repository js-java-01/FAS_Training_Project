import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import HeaderRight from "@/components/layout/HeaderRight";
import {SidebarMenu} from "@/components/layout/Sidebar.tsx";
import DynamicBreadcrumbs from "@/components/layout/DynamicBreadcrumbs.tsx";

export function MainLayout({
                               children,
                               pathName,
                           }: {
    children: React.ReactNode;
    pathName?: Record<string, string>;
}) {
    return (
        <SidebarProvider>
            <SidebarMenu />
            <SidebarInset  className="h-screen flex flex-col overflow-hidden max-h-[calc(100vh-18px)]">
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4 w-full justify-between">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4"
                            />
                            <DynamicBreadcrumbs pathTitles={pathName} />
                        </div>
                        <HeaderRight />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto min-h-0 flex flex-col px-6 pb-6 pt-0">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}