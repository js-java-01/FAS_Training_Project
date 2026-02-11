import {MainLayout} from "@/components/layout/MainLayout.tsx";
import ModulesTable from "@/pages/modules/module/table.tsx";
import {Layers} from "lucide-react";


export default function ModulesManagement() {
    return (
        <MainLayout pathName={{ modules: "Modules Management" }}>
            <div className={"h-full flex-1 flex flex-col gap-4"}>
                <div className={"flex flex-col"}>
                    <div className={"flex gap-2"}>
                        <Layers className={"inline-block text-gray-600"}/>
                        <h1 className={"text-xl font-bold"}>Modules Management</h1>
                    </div>
                    <p className={"text-gray-500 text-sm"}>View and manage modules in the system.</p>
                </div>
                <ModulesTable/>
            </div>
        </MainLayout>
    );
}

