import { MainLayout } from "@/components/layout/MainLayout";
import TrainingClassesTable from "@/pages/training-classes/table";
import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";

export default function TrainingClassesManagement() {
  const { role, permissions } = useSelector((state: RootState) => state.auth);

  return (
    <MainLayout pathName={{ classes: "Classes" }}>
      <div className="h-full flex-1 flex flex-col gap-4">
        <TrainingClassesTable
          role={role}
          mode="all"
          permissions={permissions}
        />
      </div>
    </MainLayout>
  );
}
