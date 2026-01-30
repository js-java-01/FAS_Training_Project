import {MainLayout} from "@/components/MainLayout";
import {Card} from "@/components/ui/card";
import ModuleGroupsTable from "@/pages/modules/module_groups/table.tsx";
import DynamicBreadcrumbs from "@/components/DynamicBreadcrumbs.tsx";


export default function ModuleGroupsManagement() {
    return (
        <MainLayout>

            <div className="flex flex-col h-full gap-6">
                <DynamicBreadcrumbs pathTitles={{moduleGroups: "Module Group Management"}}/>
                {/* Card chiếm toàn bộ phần còn lại */}
                <Card className="flex-1 flex flex-col px-6 py-8">
                    <ModuleGroupsTable/>
                </Card>
            </div>
        </MainLayout>
    );
}

