import { MainLayout } from "@/components/layout/MainLayout.tsx";
import DynamicBreadcrumbs from "@/components/layout/DynamicBreadcrumbs.tsx";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

type ModuleGroup = {
    id: string;
    name: string;
};

export default function ModulesManagement() {
    const { id } = useParams<{ id: string }>();
    const [moduleGroup, setModuleGroup] = useState<ModuleGroup | null>(null);

    useEffect(() => {
        if (!id) return;

        // giả lập fetch
        setTimeout(() => {
            setModuleGroup({
                id,
                name: "User Management",
            });
        }, 300);
    }, [id]);

    return (
        <MainLayout breadcrumb={ <DynamicBreadcrumbs
            pathTitles={{
                moduleGroups: "Module Groups",
                ...(moduleGroup ? { [id!]: moduleGroup.name } : {}),
            }}
        />}>


            <h1>{moduleGroup?.name ?? "Loading..."}</h1>
        </MainLayout>
    );
}
