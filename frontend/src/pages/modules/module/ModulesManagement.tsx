import { MainLayout } from "@/components/layout/MainLayout.tsx";
import ModulesTable from "@/pages/modules/module/ModuleTable";


export default function ModulesManagement() {
    return (
        <MainLayout pathName={{ modules: "Modules Management" }}>
            <div className={"h-full flex-1 flex flex-col gap-4"}>
                <ModulesTable />
            </div>
        </MainLayout>
    );
}
