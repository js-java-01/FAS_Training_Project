import { questionCategoryApi } from "@/api";
import { ProTable } from "@/components/datatable/ProTable";
import { MainLayout } from "@/components/layout/MainLayout";
import { useProTable } from "@/hooks/useProTable";
import type { EntitySchema } from "@/types/common/datatable";

const questionCategorySchema: EntitySchema = {
    entityName: "questionCategory",
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

const QuestionCategoryManagement = () => {
    const table = useProTable(questionCategoryApi, questionCategorySchema);

    return (
        <MainLayout pathName={{ "question-categories": "Question Categories" }}>
            <ProTable table={table} />
        </MainLayout>
    );
};

export default QuestionCategoryManagement;
