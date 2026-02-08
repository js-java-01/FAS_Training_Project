import {MainLayout} from "@/components/layout/MainLayout.tsx";
import ModuleGroupsTable from "@/pages/modules/module_groups/table.tsx";
import MainHeader from "@/components/layout/MainHeader.tsx";


export default function ModuleGroupsManagement() {
    return (
        <MainLayout pathName={{ moduleGroups: "Module Groups Management" }}>
            <div className={"h-full flex-1 flex flex-col gap-4"}>
                <MainHeader title={"Module Groups Management"} description={"View and manage module groups in the system."}/>
                <ModuleGroupsTable/>
            </div>
        </MainLayout>
    );
}

