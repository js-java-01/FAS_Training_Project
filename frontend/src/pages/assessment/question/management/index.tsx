import { questionApi, questionCategoryApi, questionTagApi } from "@/api";
import { ProTable } from "@/components/datatable/ProTable";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useProTable } from "@/hooks/useProTable";
import type { EntitySchema } from "@/types/common/datatable";
import { useNavigate } from "react-router-dom";

interface QuestionOption {
    id: string | number;
    content: string;
    orderIndex: number;
    correct: boolean;
}

const questionSchema: EntitySchema = {
    entityName: "question",
    idField: "id",
    fields: [
        {
            name: "content",
            label: "Content",
            type: "textarea",
            sortable: true,
            filterable: true,
            filterType: "text",
            bold: true,
        },
        {
            name: "questionType",
            label: "Question Type",
            type: "select",
            sortable: true,
            filterable: true,
            filterType: "select",
            options: [
                { label: "Single Choice", value: "SINGLE" },
                { label: "Multiple Choice", value: "MULTIPLE" },
                { label: "True / False", value: "TRUE_FALSE" },
            ],
        },
        {
            name: "categoryId",
            label: "Category",
            type: "relation",
            relation: {
                api: questionCategoryApi,
                valueField: "id",
                labelField: "name",
            },
            sortable: true,
            filterable: true,
            filterType: "select",
        },
        {
            name: "tagIds",
            label: "Tags",
            type: "relation",
            relation: {
                api: questionTagApi,
                valueField: "id",
                labelField: "name",
                multiple: true,
            },
            filterable: true,
            filterType: "select",
        },
        {
            name: "options",
            label: "Options",
            type: "text",
            editable: false,
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
            sortable: true,
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

const ProTableQuestionManagementPage = () => {
    const navigate = useNavigate();
    const table = useProTable(questionApi, questionSchema);

    return (
        <MainLayout pathName={{ questions: "Question Management" }}>
            <ProTable
                table={table}
                headerActions={
                    <div className="flex gap-2">
                        <Button onClick={() => navigate("/questions/create")}>
                            Create
                        </Button>
                    </div>
                }
                onEdit={(row) => navigate(`/questions/${row.id}/edit`)}
                expandable={{
                    enabled: true,
                    renderExpandedRow: (row) => (
                        <div className="p-4 space-y-2">
                            {Array.isArray(row.options) && row.options.length > 0 ? (
                                [...row.options]
                                    .sort((a: QuestionOption, b: QuestionOption) => a.orderIndex - b.orderIndex)
                                    .map((opt: QuestionOption, i: number) => (
                                        <div
                                            key={opt.id}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${opt.correct
                                                    ? "bg-green-50 border border-green-200 text-green-800"
                                                    : "bg-muted"
                                                }`}
                                        >
                                            <span className="font-medium min-w-[1.25rem]">
                                                {String.fromCharCode(65 + i)}.
                                            </span>
                                            <span className="flex-1">{opt.content}</span>
                                            {opt.correct && (
                                                <span className="text-green-600 font-semibold text-xs">✓</span>
                                            )}
                                        </div>
                                    ))
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No options available.</p>
                            )}
                        </div>
                    ),
                }}
            />
        </MainLayout>
    );
};

export default ProTableQuestionManagementPage;