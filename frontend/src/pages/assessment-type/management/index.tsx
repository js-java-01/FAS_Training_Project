import { assessmentTypeApi } from "@/api";
import { ProTable } from "@/components/datatable/ProTable";
import { MainLayout } from "@/components/layout/MainLayout";
import { useProTable } from "@/hooks/useProTable";
import type { EntitySchema } from "@/types/common/datatable";

const assessmentTypeSchema: EntitySchema = {
    entityName: "assessmentType",
    idField: "id",
    fields: [
        {
            name: "name",
            label: "Name",
            type: "text",
            sortable: true,
            filterable: true,
            filterType: "text",
        },
        {
            name: "description",
            label: "Description",
            type: "text",
            sortable: true,
            filterable: true,
            filterType: "text",
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

const AssessmentTypeManagementPage = () => {
    const table = useProTable(assessmentTypeApi, assessmentTypeSchema);

    return (
        <MainLayout pathName={{ "assessment-type": "Assessment Type Management" }}>
            <ProTable table={table} />
        </MainLayout>
    );
};

export default AssessmentTypeManagementPage;
