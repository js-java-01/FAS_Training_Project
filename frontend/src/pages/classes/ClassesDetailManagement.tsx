import { MainLayoutSkeleton } from "@/components/skeleton/MainLayoutSkeleton";
import { useRoleSwitch } from "@/contexts/RoleSwitchContext";
import { ROLES } from "@/types/role";
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
      case ROLES.SUPER_ADMIN:
      case ROLES.ADMIN:
      case ROLES.TRAINER:
      case ROLES.STUDENT:
        return roleComponents.adminDetail;

      default:
        return roleComponents.unauthorized;
    }
  };

  const Component = getComponent();

  return (
    <Suspense fallback={<MainLayoutSkeleton />}>
      <Component />
    </Suspense>
  );
}
