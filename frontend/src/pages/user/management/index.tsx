import { userApi } from "@/api";
import { roleApi } from "@/api/features/auth/role.api";
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
      name: "password",
      label: "Password",
      type: "password",
      visible: false,
      hideable: false,
    },
    {
      name: "roleIds",
      label: "Role",
      type: "relation",
      relation: {
        api: roleApi,
        valueField: "id",
        labelField: "name",
        multiple: true,
      },
      filterable: true,
      filterType: "select",
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
      filterable: true,
      filterType: "dateRange",
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

const UserManagementPage = () => {
  const table = useProTable(userApi, userSchema);

  return (
    <MainLayout pathName={{ users: "User Management" }}>
      <ProTable table={table} />
    </MainLayout>
  );
};

export default UserManagementPage;
