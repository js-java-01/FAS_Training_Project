import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
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
        <div className="flex min-h-dvh w-full">
          <SidebarMenu />

          <div className="flex flex-1 flex-col">
            <header className="sticky w-full top-0 z-50 border-b bg-card">
              <div className="mx-auto flex items-center justify-between px-6 py-2">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <Separator orientation="vertical" className="h-4" />
                  {breadcrumb}
                </div>

                <HeaderRight />
              </div>
            </header>

            <main className="mx-auto w-full h-screen flex-1 lg:px-4 py-6">
              <Card className={"h-full"}>
                <CardContent className={"h-full"}>{children}</CardContent>
              </Card>
            </main>
          </div>
        </div>
      </SidebarProvider>
  );
}
