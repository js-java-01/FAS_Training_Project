import { MainLayout } from "@/components/layout/MainLayout";
import TrainingClassesTable from "@/pages/training-classes/table";

export default function TrainingClassesManagement() {
    return (
        <MainLayout pathName={{ trainingClasses: "Training Classes" }}>
            <div className="h-full flex-1 flex flex-col gap-4">
                <TrainingClassesTable />
            </div>
        </MainLayout>
    );
}
