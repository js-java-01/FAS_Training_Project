import { MainLayout } from "@/components/layout/MainLayout";
import SemestersGrid from "../../semesters/SemestersGrid";

export default function TrainerClassesManagement() {
  return (
    <MainLayout pathName={{ trainingClasses: "Quản lý lớp học" }}>
      <div className="h-full flex-1 flex flex-col gap-4">
        <SemestersGrid />
      </div>
    </MainLayout>
  );
}
