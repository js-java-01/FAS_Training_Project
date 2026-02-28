import { userApi } from "@/api";
import { ProTable } from "@/components/datatable/ProTable";
import { MainLayout } from "@/components/layout/MainLayout";
import { useProTable } from "@/hooks/useProTable";
import type { EntitySchema } from "@/types/common/datatable";

const userSchema: EntitySchema = {
  entityName: "user",
  idField: "id",
  fields: [
    {
      name: "email",
      label: "Email",
      type: "text",
      sortable: true,
    },
    {
      name: "firstName",
      label: "First Name",
      type: "text",
      sortable: true,
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "text",
      sortable: true,
    },
    {
      name: "role",
      label: "Role",
      type: "text",
      filterable: true,
      filterType: "select",
    },
    {
      name: "isActive",
      label: "Status",
      type: "boolean",
      booleanLabels: { true: "Active", false: "Inactive" },
      filterable: true,
      filterType: "boolean",
    },
  ],
};

const UserManagementTest = () => {
  const table = useProTable(userApi, userSchema);

  return (
    <MainLayout pathName={{ users: "User Management" }}>
      <ProTable table={table} />
    </MainLayout>
  );
};

export default UserManagementTest;
