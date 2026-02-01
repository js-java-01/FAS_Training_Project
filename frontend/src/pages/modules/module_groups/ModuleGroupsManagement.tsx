import {MainLayout} from "@/components/layout/MainLayout.tsx";
import ModuleGroupsTable from "@/pages/modules/module_groups/table.tsx";
import {FolderOpen} from "lucide-react";


export default function ModuleGroupsManagement() {
    return (
        <MainLayout pathName={{ moduleGroups: "Module Groups Management" }}>
            <div className={"h-full flex-1 flex flex-col gap-4"}>
               <div className={"flex flex-col"}>
                  <div className={"flex gap-2"}>
                      <FolderOpen className={"inline-block text-gray-600"}/>
                      <h1 className={"text-xl font-bold"}>Module Groups Management</h1>
                  </div>
                   <p className={"text-gray-500 text-sm"}>View and manage module groups in the system.</p>
               </div>
                <ModuleGroupsTable/>
            </div>
        </MainLayout>
    );
}

