import { MainLayoutSkeleton } from "@/components/skeleton/MainLayoutSkeleton";
import { useRoleSwitch } from "@/contexts/RoleSwitchContext";
import { ROLES } from "@/types/role";
import { lazy, Suspense } from "react";

const StudentComponent = lazy(() => import("./StudentProgramManagement"));

const UnauthorizedComponent = lazy(() => import("../Unauthorized"));

const AdminComponent = lazy(() => import("./ProgramsManagement"));

const roleComponents = {
  student: StudentComponent,
  unauthorized: UnauthorizedComponent,
  admin: AdminComponent,
};

export default function ProgramManagement() {
  const { activeRole } = useRoleSwitch();

  const getComponents = () => {
    switch (activeRole?.name) {
      case ROLES.STUDENT:
        return roleComponents.student;

      case ROLES.SUPER_ADMIN:
      case ROLES.ADMIN:
        return roleComponents.admin;

      default:
        return roleComponents.unauthorized;
    }
  };

  const Component = getComponents();

  return (
    <Suspense fallback={<MainLayoutSkeleton />}>
      <Component />
    </Suspense>
  );
}
