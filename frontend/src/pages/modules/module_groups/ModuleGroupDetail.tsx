import { MainLayout } from "@/components/layout/MainLayout.tsx";
import DynamicBreadcrumbs from "@/components/layout/DynamicBreadcrumbs.tsx";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { b64DecodeUnicode } from "@/utils/base64.utils.ts";
import type { Menu } from "@/types/menu.ts";
import {FolderOpen} from "lucide-react";
import {Card, CardContent, CardHeader} from "@/components/ui/card.tsx";
import {mockMenus} from "@/mocks/mockMenus.mock.ts";

export default function ModuleGroupDetail() {
    const { id } = useParams<{ id: string }>();
    const [moduleGroup, setModuleGroup] = useState<Menu | null>(null);

    const parentId = id ? b64DecodeUnicode(id) : null;

    useEffect(() => {
        if (!parentId) return;

        const found = mockMenus.find((m) => m.id === parentId);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setModuleGroup(found ?? null);
    }, [parentId]);
console.log(moduleGroup);
    return (
        <MainLayout
            breadcrumb={
                <DynamicBreadcrumbs
                    pathTitles={{
                        moduleGroups: "Module Groups",
                        ...(moduleGroup && id ? { [id]: moduleGroup.name } : {}),
                    }}
                />
            }
        >
           <div className={"grid grid-cols-1 gap-4"}>
               <div>
                   <div className={"flex flex-row gap-2"}> <FolderOpen />
                       <h1 className={"font-semibold"}>Module Group Details</h1></div>
                   <p className={"text-gray-500 text-[15px]"}>Overview and update history for this module group</p>
               </div>

               <div className={"grid grid-cols-[auto_1fr] gap-4"}>
                   <Card className={"grid bg-muted min-w-[500px]"}>
                       <CardHeader className={"flex flex-row gap-4"}>
                           <div className={"bg-gray-200 rounded-4xl p-4 w-fit border border-gray-300 text-gray-500"}><FolderOpen/></div>
                           <div>
                               <h1 className={"font-semibold text-lg"}>{moduleGroup?.name}</h1>
                               <p className={" text-gray-500"}>ID: {moduleGroup?.id}</p>
                           </div>
                       </CardHeader>
                       <CardContent>

                       </CardContent>
                   </Card>
               </div>
           </div>

        </MainLayout>
    );
}
