import { MainLayout } from "@/components/layout/MainLayout";
import PermissionsTable from "./PermissionsTable";

export default function PermissionsManagement() {
  return (
    <MainLayout pathName={{ permissions: "Permissions Management" }}>
      <div className="h-full flex-1 flex flex-col gap-4">
        <PermissionsTable />
      </div>
    </MainLayout>
  );
}
