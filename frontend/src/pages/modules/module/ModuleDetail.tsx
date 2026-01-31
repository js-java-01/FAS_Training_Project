import { MainLayout } from "@/components/layout/MainLayout.tsx";
import DynamicBreadcrumbs from "@/components/layout/DynamicBreadcrumbs.tsx";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { b64DecodeUnicode } from "@/utils/base64.utils.ts";
import type { MenuItem } from "@/types/menu.ts";
import { FileCode, Activity, Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { mockMenus } from "@/mocks/mockMenus.mock";
import { iconMap } from "@/constants/iconMap";

export default function ModuleDetail() {
    const { id } = useParams<{ id: string }>();
    const [moduleData, setModuleData] = useState<MenuItem | null>(null);

    const moduleId = id ? b64DecodeUnicode(id) : null;

    useEffect(() => {
        if (!moduleId) return;
        const allItems = mockMenus.flatMap(m => m.menuItems);
        const found = allItems.find((m) => m.id === moduleId);
        setModuleData(found ?? null);
    }, [moduleId]);

    if (!moduleData) {
        return (
             <MainLayout breadcrumb={<DynamicBreadcrumbs pathTitles={{ modules: "Module Management", details: "Loading..." }} />}>
                <div>Loading...</div>
             </MainLayout>
        )
    }

    const IconComponent = moduleData.icon ? iconMap[moduleData.icon] : FileCode;

    return (
        <MainLayout
            breadcrumb={
                <DynamicBreadcrumbs
                    pathTitles={{
                        modules: "Module Management",
                        ...(moduleData && id ? { [id]: moduleData.title } : {}),
                    }}
                />
            }
        >
            <div className={"grid grid-cols-1 gap-4"}>
                <div>
                    <div className={"flex flex-row gap-2"}>
                        <IconComponent />
                        <h1 className={"font-semibold"}>Module Details</h1>
                    </div>
                    <p className={"text-gray-500 text-[15px]"}>
                        Overview for this module
                    </p>
                </div>

                <div className={"grid grid-cols-[auto_1fr] gap-4"}>
                    <Card className={"grid bg-muted min-w-[500px]"}>
                        <CardHeader className={"flex flex-row gap-4"}>
                            <div className={"bg-gray-200 rounded-4xl p-4 w-fit border border-gray-300 text-gray-500"}>
                                <IconComponent />
                            </div>
                            <div>
                                <h1 className={"font-semibold text-lg"}>{moduleData.title}</h1>
                                <p className={" text-gray-500"}>ID: {moduleData.id}</p>
                            </div>
                        </CardHeader>
                        <CardContent className={"grid grid-cols-2 gap-4"}>
                            <div className="col-span-2">
                                <label className="text-sm font-medium text-gray-500">Description</label>
                                <p>{moduleData.description || "No description"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">URL</label>
                                <div className="flex items-center gap-2">
                                    <LinkIcon className="h-4 w-4 text-gray-400" />
                                    <span>{moduleData.url || "N/A"}</span>
                                </div>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-gray-500">Required Permission</label>
                                <p>{moduleData.requiredPermission || "None"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Status</label>
                                <div className="flex items-center gap-2">
                                     <Activity className={`h-4 w-4 ${moduleData.isActive ? "text-green-500" : "text-gray-400"}`} />
                                    <span>{moduleData.isActive ? "Active" : "Inactive"}</span>
                                </div>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-gray-500">Display Order</label>
                                <p>{moduleData.displayOrder}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Menu Group ID</label>
                                <p>{moduleData.menuId}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
