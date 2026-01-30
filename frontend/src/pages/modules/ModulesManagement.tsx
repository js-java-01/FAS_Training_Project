import { MainLayout } from "@/components/layout/MainLayout";
import DynamicBreadcrumbs from "@/components/layout/DynamicBreadcrumbs";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { b64DecodeUnicode } from "@/utils/base64.utils.ts";
import type { Menu } from "@/types/menu";
import { mockModuleGroups } from "../../mocks/moduleGroups.mock.ts";

export default function ModulesManagement() {
    const { id } = useParams<{ id: string }>();
    const [moduleGroup, setModuleGroup] = useState<Menu | null>(null);

    const parentId = id ? b64DecodeUnicode(id) : null;

    useEffect(() => {
        if (!parentId) return;

        const found = mockModuleGroups.find((m) => m.id === parentId);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setModuleGroup(found ?? null);
    }, [parentId]);

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
            <h1 className="text-xl font-semibold mb-4">
                {moduleGroup?.name ?? "Loading..."}
            </h1>

        </MainLayout>
    );
}
