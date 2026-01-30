import {MainLayout} from "@/components/MainLayout";
import {Card} from "@/components/ui/card";
import ModuleGroupsTable from "@/pages/modules/module_groups/table.tsx";


export default function ModulesManagement() {
    return (
        <MainLayout>
            <div className="flex flex-col h-full gap-6 mx-2">
                {/* Card chiếm toàn bộ phần còn lại */}
                <Card className="flex-1 flex flex-col px-6 py-8">
                    <ModuleGroupsTable/>
                </Card>
            </div>
        </MainLayout>
    );
}

