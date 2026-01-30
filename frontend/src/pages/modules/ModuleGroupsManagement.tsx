import {MainLayout} from "@/components/layout/MainLayout.tsx";
import ModuleGroupsTable from "@/pages/modules/module_groups/table.tsx";
import DynamicBreadcrumbs from "@/components/layout/DynamicBreadcrumbs.tsx";


export default function ModuleGroupsManagement() {
    return (
        <MainLayout breadcrumb={<DynamicBreadcrumbs pathTitles={{moduleGroups: "Module Group Management"}}/>}>
            <ModuleGroupsTable/>
        </MainLayout>
    );
}

