import { MainLayout } from "@/components/layout/MainLayout";
import TrainingClassesTable from "@/pages/training-classes/table";
import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";

interface TrainingClassesManagementProps {
  semesterId: string;
}

export default function TrainingClassesManagement({}: TrainingClassesManagementProps) {
  return (
    <MainLayout pathName={{ trainingClasses: "Training Classes" }}>
      <div className="h-full flex-1 flex flex-col gap-4">
        {/* <TrainingClassesTable role={role} semesterId={semesterId} /> */}
      </div>
    </MainLayout>
  );
}
