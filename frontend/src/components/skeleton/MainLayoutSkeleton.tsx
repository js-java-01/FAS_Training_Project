import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarMenu } from "@/components/layout/Sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export function MainLayoutSkeleton() {
  return (
    <SidebarProvider>
      <SidebarMenu />

      <SidebarInset className="h-screen flex flex-col overflow-hidden max-h-[calc(100vh-18px)]">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4 w-full justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>

            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto min-h-0 flex flex-col px-6 pb-6 pt-6 space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-64 w-full rounded-2xl" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>

          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
