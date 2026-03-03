import { questionTagApi } from "@/api";
import { ProTable } from "@/components/datatable/ProTable";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useProTable } from "@/hooks/useProTable";
import type { EntitySchema } from "@/types/common/datatable";
import { useNavigate } from "react-router";

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
    const navigate = useNavigate();
    const table = useProTable(questionTagApi, questionTagSchema);

    return (
        <MainLayout pathName={{ "question-tag": "Question Tag Management" }}>
            <ProTable
                table={table}
                // headerActions={<Button onClick={() => navigate("/teacher-assessment/create")}>Create</Button>}
                // onEdit={(row) => navigate(`/questions/${row.id}/edit`)}        
            />
        </MainLayout>
    );
};

export default QuestionTagManagementPage;
