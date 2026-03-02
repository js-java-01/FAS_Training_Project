import { programmingLanguageApi } from "@/api";
import { ProTable } from "@/components/datatable/ProTable";
import { MainLayout } from "@/components/layout/MainLayout";
import { useProTable } from "@/hooks/useProTable";
import type { EntitySchema } from "@/types/common/datatable";

const programmingLanguageSchema: EntitySchema = {
  entityName: "programming-language",
  idField: "id",
  fields: [
    {
      name: "name",
      label: "Name",
      type: "text",
      sortable: true,
      bold: true,
    },
    {
      name: "version",
      label: "Version",
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
      name: "isSupported",
      label: "Supported",
      type: "boolean",
      booleanLabels: {
        true: "Supported",
        false: "Not Supported",
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

const ProgrammingLanguageManagement = () => {
  const table = useProTable(programmingLanguageApi, programmingLanguageSchema);

  return (
    <MainLayout pathName={{ programmingLanguages: "Programming Languages" }}>
      <ProTable table={table} />
    </MainLayout>
  );
};

export default ProgrammingLanguageManagement;