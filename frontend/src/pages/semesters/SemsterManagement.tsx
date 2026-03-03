import { MainLayout } from "@/components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
import SemestersTable from "./SemestersTable";
import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";

export default function SemesterManagement() {
  const navigate = useNavigate();

  const { role } = useSelector((state: RootState) => state.auth);

  const handleSelectSemester = (id: string) => {
    navigate(`/trainer/classes`, { state: { semesterId: id } });
  };

  return (
    <MainLayout pathName={{ semesters: "Quản lý kỳ học" }}>
      <div className="h-full flex-1 flex flex-col gap-4">
        {/* <SemestersGrid onSelectSemester={handleSelectSemester} /> */}
        <SemestersTable onSelectSemester={handleSelectSemester} role={role} />
      </div>
    </MainLayout>
  );
}
