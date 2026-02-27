import { useRoleSwitch } from "@/contexts/RoleSwitchContext";
import { lazy, Suspense } from "react";

const AdminDetailComponent = lazy(
  () => import("../training-classes/ClassDetailPage")
);

const UnauthorizedComponent = lazy(
  () => import("../Unauthorized")
);

const roleComponents = {
  adminDetail: AdminDetailComponent,
  unauthorized: UnauthorizedComponent,
};

export default function ClassesDetailComponent() {
  const { activeRole } = useRoleSwitch();

  const getComponent = () => {
    switch (activeRole?.name) {
      case "SUPERADMIN":
      case "ADMIN":
        return roleComponents.adminDetail;

      default:
        return roleComponents.unauthorized;
    }
  };

  const Component = getComponent();

  return (
    <Suspense>
      <Component />
    </Suspense>
  );
}
