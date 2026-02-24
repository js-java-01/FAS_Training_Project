import { MainLayout } from "@/components/layout/MainLayout.tsx";
import ModuleGroupsTable from "@/pages/modules/module_groups/table.tsx";


export default function ModuleGroupsManagement() {
    return (
        <MainLayout pathName={{ moduleGroups: "Module Groups Management" }}>
            <div className={"h-full flex-1 flex flex-col gap-4"}>
                <ModuleGroupsTable />
            </div>
        </MainLayout>
    );
}

