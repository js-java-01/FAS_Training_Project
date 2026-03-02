import { questionTagApi } from "@/api";
import { ProTable } from "@/components/datatable/ProTable";
import { MainLayout } from "@/components/layout/MainLayout";
import { useProTable } from "@/hooks/useProTable";
import type { EntitySchema } from "@/types/common/datatable";

const questionTagSchema: EntitySchema = {
    entityName: "questionTag",
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

const QuestionTagManagementPage = () => {
    const table = useProTable(questionTagApi, questionTagSchema);

    return (
        <MainLayout pathName={{ "question-tag": "Question Tag Management" }}>
            <ProTable table={table} />
        </MainLayout>
    );
};

export default QuestionTagManagementPage;
