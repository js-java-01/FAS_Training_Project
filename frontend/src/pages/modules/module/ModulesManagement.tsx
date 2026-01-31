import {MainLayout} from "@/components/layout/MainLayout.tsx";
import DynamicBreadcrumbs from "@/components/layout/DynamicBreadcrumbs.tsx";
import ModulesTable from "@/pages/modules/module/table.tsx";


export default function ModulesManagement() {
    return (
        <MainLayout breadcrumb={<DynamicBreadcrumbs pathTitles={{modules: "Module Management"}}/>}>
            <ModulesTable/>
        </MainLayout>
    );
}

