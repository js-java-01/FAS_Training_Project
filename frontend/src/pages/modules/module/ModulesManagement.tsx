import {MainLayout} from "@/components/layout/MainLayout.tsx";
import ModulesTable from "@/pages/modules/module/table.tsx";
import MainHeader from "@/components/layout/MainHeader.tsx";


export default function ModulesManagement() {
    return (
        <MainLayout pathName={{ modules: "Modules Management" }}>
            <div className={"h-full flex-1 flex flex-col gap-4"}>
                <MainHeader title={"Modules Management"} description={"View and manage modules in the system"}/>
                <ModulesTable/>
            </div>
        </MainLayout>
    );
}

