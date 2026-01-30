import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import HeaderRight from "@/components/layout/HeaderRight";
import {SidebarMenu} from "@/components/layout/Sidebar.tsx";

export function MainLayout({
                             children,
                             breadcrumb,
                           }: {
  children: React.ReactNode;
  breadcrumb?: React.ReactNode;
}) {
  return (
      <SidebarProvider>
          <SidebarMenu />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4 w-full justify-between">
                        <div className="flex items-center gap-2">
                          <SidebarTrigger className="-ml-1" />
                          <Separator
                              orientation="vertical"
                              className="mr-2 data-[orientation=vertical]:h-4"
                          />
                          {breadcrumb}
                      </div>
                        <HeaderRight />
                    </div>
                </header>

                <main className="mx-auto w-full h-screen flex-1 lg:px-4 py-6">
                    {children}
                </main>
            </SidebarInset>
        {/*</div>*/}
      </SidebarProvider>
  );
}
