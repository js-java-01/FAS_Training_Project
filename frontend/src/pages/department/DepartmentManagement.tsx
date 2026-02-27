import { MainLayout } from "../../components/layout/MainLayout";
import DepartmentsTable from "./table";

const DepartmentManagement = () => {
  return (
    <MainLayout pathName={{ departments: "Department Management" }}>
      <div className="h-full flex-1 flex flex-col gap-4">
        <DepartmentsTable />
      </div>
    </MainLayout>
  );
};

export default DepartmentManagement;
