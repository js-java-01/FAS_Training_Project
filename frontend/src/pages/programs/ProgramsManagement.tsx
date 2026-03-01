import { MainLayout } from "@/components/layout/MainLayout";
import ProgramsTable from "./table";

export default function ProgramsManagement() {
  return (
    <MainLayout pathName={{ programs: "Programs" }}>
      <div className="h-full flex-1 flex flex-col gap-4">
        <ProgramsTable />
      </div>
    </MainLayout>
  );
}
