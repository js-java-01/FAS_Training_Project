import { roleApi } from "@/api/features/auth/role.api";
import { ProTable } from "@/components/datatable/ProTable";
import { MainLayout } from "@/components/layout/MainLayout";
import { useProTable } from "@/hooks/useProTable";
import type { EntitySchema } from "@/types/common/datatable";

const roleSchema: EntitySchema = {
  entityName: "role",
  idField: "id",
  fields: [
    {
      name: "name",
      label: "Name",
      type: "text",
      sortable: true,
    },
    {
      name: "description",
      label: "Description",
      type: "text",
      sortable: true,
    },
    {
      name: "isActive",
      label: "Status",
      type: "boolean",
      booleanLabels: {
        true: "Active",
        false: "Inactive",
        trueColor: "bg-green-500 text-white",
        falseColor: "bg-red-400 text-white",
      },
      filterable: true,
      filterType: "boolean",
    },
    {
      name: "createdAt",
      label: "Created At",
      type: "date",
      sortable: true,
      editable: false,
    },
    {
      name: "updatedAt",
      label: "Updated At",
      type: "date",
      sortable: true,
      editable: false,
      visible: false,
    },
  ],
};

const RoleManagementPage = () => {
  const table = useProTable(roleApi, roleSchema);

  return (
    <MainLayout pathName={{ roles: "Role Management" }}>
      <ProTable table={table} />
    </MainLayout>
  );
};

export default RoleManagementPage;
