import { MainLayout } from "@/components/layout/MainLayout";
import TrainingClassesTable from "@/pages/training-classes/table";
import { useRoleSwitch } from "@/contexts/RoleSwitchContext";

export default function TrainingClassesManagement() {
  const { activeRole, activePermissions } = useRoleSwitch();
  const role = activeRole?.name ?? "";
  const permissions = activePermissions;

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
