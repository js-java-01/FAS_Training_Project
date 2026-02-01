import { MainLayout } from "@/components/layout/MainLayout";
import DynamicBreadcrumbs from "@/components/layout/DynamicBreadcrumbs";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { b64DecodeUnicode } from "@/utils/base64.utils";
import type { ModuleGroup } from "@/types/module";
import { FolderOpen } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { moduleGroupApi } from "@/api/moduleApi";

export default function ModuleGroupDetail() {
    const { id } = useParams<{ id: string }>();

    const [moduleGroup, setModuleGroup] = useState<ModuleGroup | null>(null);
    const [loading, setLoading] = useState(false);

    const moduleGroupId = id ? b64DecodeUnicode(id) : null;

    /* -------- LOAD MODULE GROUP DETAIL -------- */
    useEffect(() => {
        if (!moduleGroupId) return;

        let mounted = true;

        const fetchDetail = async () => {
            setLoading(true);
            try {
                const res = await moduleGroupApi.getModuleGroupById(moduleGroupId);
                if (mounted) {
                    setModuleGroup(res);
                }
            } catch (err) {
                console.error("Failed to load module group", err);
                if (mounted) {
                    setModuleGroup(null);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchDetail();

        return () => {
            mounted = false;
        };
    }, [moduleGroupId]);
    /* ----------------------------------------- */

    const name =
        loading
            ? "Loading..."
            : moduleGroup?.name ?? "Không đủ dữ liệu để xác minh";

    const idText =
        loading
            ? "..."
            : moduleGroup?.id ?? "Không đủ dữ liệu để xác minh";

    const description =
        moduleGroup?.description ?? "Không đủ dữ liệu để xác minh";

    const order =
        typeof moduleGroup?.displayOrder === "number"
            ? moduleGroup.displayOrder
            : "Không đủ dữ liệu để xác minh";

    const status =
        typeof moduleGroup?.isActive === "boolean"
            ? moduleGroup.isActive
                ? "Active"
                : "Inactive"
            : "Không đủ dữ liệu để xác minh";

    const createdAt =
        moduleGroup?.createdAt
            ? new Date(moduleGroup.createdAt).toLocaleString()
            : "Không đủ dữ liệu để xác minh";

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
            <div className="grid grid-cols-1 gap-4">
                {/* Header */}
                <div>
                    <div className="flex flex-row gap-2 items-center">
                        <FolderOpen />
                        <h1 className="font-semibold">Module Group Details</h1>
                    </div>
                    <p className="text-gray-500 text-[15px]">
                        Overview and basic information for this module group
                    </p>
                </div>

                {/* Detail card */}
                <div className="grid grid-cols-[auto_1fr] gap-4">
                    <Card className="grid bg-muted min-w-[500px]">
                        <CardHeader className="flex flex-row gap-4 items-center">
                            <div className="bg-gray-200 rounded-4xl p-4 w-fit border border-gray-300 text-gray-500">
                                <FolderOpen />
                            </div>

                            <div>
                                <h2 className="font-semibold text-lg">
                                    {name}
                                </h2>
                                <p className="text-gray-500">ID: {idText}</p>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {/* Description */}
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-700">
                                    Description
                                </h4>
                                <p className="text-sm text-gray-600">
                                    {loading ? "Loading..." : description}
                                </p>
                            </div>

                            {/* Basic info row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <h5 className="text-xs font-medium text-gray-600">
                                        Order
                                    </h5>
                                    <div className="text-sm text-gray-700">
                                        {loading ? "..." : order}
                                    </div>
                                </div>

                                <div>
                                    <h5 className="text-xs font-medium text-gray-600">
                                        Status
                                    </h5>
                                    <div className="text-sm text-gray-700">
                                        {loading ? "..." : status}
                                    </div>
                                </div>

                                <div>
                                    <h5 className="text-xs font-medium text-gray-600">
                                        Created At
                                    </h5>
                                    <div className="text-sm text-gray-700">
                                        {loading ? "..." : createdAt}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
