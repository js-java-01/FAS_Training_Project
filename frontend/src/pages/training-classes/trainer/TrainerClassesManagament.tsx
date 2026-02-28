import { MainLayout } from "@/components/layout/MainLayout";
import SemestersGrid from "../../semesters/SemestersGrid";
import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { useState } from "react";
import TrainingClassesTable from "../table";
import ClassDetailManagement from "@/pages/classes/ClassDetailManagement";

export default function TrainerClassesManagement() {
  const { role, permissions } = useSelector((state: RootState) => state.auth);

  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [selectedClassData, setSelectedClassData] = useState<{ id: string; name: string } | null>(null);

  const handleViewDetails = (id: string, name: string) => {
    setSelectedClassData({ id, name });
  };

  return (
    <MainLayout pathName={{ trainingClasses: "Quản lý lớp học" }}>
      <div className="h-full flex-1 flex flex-col gap-4">
        {!selectedSemesterId ? (
          <SemestersGrid onSelectSemester={setSelectedSemesterId} />
        ) : (
          <div className="flex flex-col gap-4 h-full flex-1">
            {selectedClassData ? (
              <ClassDetailManagement
                classId={selectedClassData.id}
                className={selectedClassData.name}
                onBack={() => setSelectedClassData(null)}
              />
            ) : (
              <TrainingClassesTable
                role={role}
                semesterId={selectedSemesterId}
                onSelectSemester={setSelectedSemesterId}
                permissions={permissions}
                onViewDetails={handleViewDetails}
              />
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
