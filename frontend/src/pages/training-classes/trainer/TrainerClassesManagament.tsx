import { MainLayout } from "@/components/layout/MainLayout";
import SemestersGrid from "../../semesters/SemestersGrid";
import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { useState } from "react";
import TrainingClassesTable from "../table";

export default function TrainerClassesManagement() {
  const { role, permissions } = useSelector((state: RootState) => state.auth);

  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);

  return (
    <MainLayout pathName={{ trainingClasses: "Quản lý lớp học" }}>
      <div className="h-full flex-1 flex flex-col gap-4 ">
        {!selectedSemesterId ? (
          <SemestersGrid onSelectSemester={setSelectedSemesterId} />
        ) : (
          <div className="flex flex-col gap-4 h-full flex-1">
            <TrainingClassesTable
              role={role}
              mode="semester"
              semesterId={selectedSemesterId}
              onSelectSemester={setSelectedSemesterId}
              permissions={permissions}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}