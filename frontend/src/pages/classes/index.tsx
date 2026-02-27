
import { useRoleSwitch } from "@/contexts/RoleSwitchContext";
import { lazy, Suspense } from "react";

const StudentComponent = lazy(
  () => import("./StudentClassManagement")
);

const UnauthorizedComponent = lazy(
  () => import("../Unauthorized")
);

const AdminComponent = lazy(
  () => import("../training-classes/TrainingClassesManagement")
);


const roleComponents = {
  student: StudentComponent,
  unauthorized: UnauthorizedComponent,
  admin: AdminComponent
};

export default function ClassesComponent() {
  const { activeRole } = useRoleSwitch();
  const getComponents = () => {
    switch (activeRole?.name) {
      case "STUDENT":
        return roleComponents.student;

      case "SUPERADMIN":
      case "ADMIN":
        return roleComponents.admin;

      default:
        return roleComponents.unauthorized;
    }
  };

  const Component = getComponents();

  return (
    <Suspense>
      <Component />
    </Suspense>
  );
}
