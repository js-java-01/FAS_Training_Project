import { assessmentApi, assessmentTypeApi } from "@/api";
import { ProTable } from "@/components/datatable/ProTable";
import { MainLayout } from "@/components/layout/MainLayout";
import { useProTable } from "@/hooks/useProTable";
import type { EntitySchema } from "@/types";
import { useNavigate } from "react-router";

const assessmentSchema: EntitySchema = {
  entityName: "assessment",
  idField: "id",
  fields: [
    {
      name: "code",
      label: "Code",
      type: "text",
      sortable: true,
      filterable: true,
      filterType: "text",
      bold: true,
    },
    {
      name: "title",
      label: "Title",
      type: "text",
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    {
      name: "assessmentTypeId",
      label: "Type",
      type: "relation",
      relation: {
        api: assessmentTypeApi,
        valueField: "id",
        labelField: "name",
        multiple: true,
      },
      filterable: true,
      filterType: "select",
    },
    {
      name: "difficulty",
      label: "Difficulty",
      type: "select",
      sortable: true,
      filterable: true,
      filterType: "select",
      options: [
        { label: "Easy", value: "EASY" },
        { label: "Medium", value: "MEDIUM" },
        { label: "Hard", value: "HARD" },
      ],
    },
    {
      name: "totalScore",
      label: "Total Score",
      type: "number",
      sortable: true,
    },
    {
      name: "passScore",
      label: "Pass Score",
      type: "number",
      sortable: true,
    },
    {
      name: "timeLimitMinutes",
      label: "Time (min)",
      type: "number",
      sortable: true,
    },
    {
      name: "attemptLimit",
      label: "Attempts",
      type: "number",
      sortable: true,
    },
    {
      name: "gradingMethod",
      label: "Grading",
      type: "select",
      sortable: true,
      options: [
        { label: "Auto", value: "AUTO" },
        { label: "Manual", value: "MANUAL" },
        { label: "Hybrid", value: "HYBRID" },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      sortable: true,
      filterable: true,
      filterType: "select",
      options: [
        { label: "Draft", value: "DRAFT" },
        { label: "Published", value: "PUBLISHED" },
        { label: "Closed", value: "CLOSED" },
      ],
    },
    {
      name: "isShuffleQuestion",
      label: "Shuffle Q",
      type: "boolean",
      sortable: true,
    },
    {
      name: "isShuffleOption",
      label: "Shuffle Option",
      type: "boolean",
      sortable: true,
      visible: false,
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

const ProTableAssessmentManagementPage = () => {
  const navigate = useNavigate();
  const table = useProTable(assessmentApi, assessmentSchema);

  return (
    <MainLayout pathName={{ assessment: "Assessment Management" }}>
      <ProTable
        table={table}
        headerActions={
          <button
            className="px-4 py-2 bg-primary text-white rounded"
            onClick={() => navigate("/teacher-assessment/create")}
          >
            Create Assessment
          </button>
        }
        onEdit={(row) => navigate(`/teacher-assessment/${row.id}/edit`)}
      />
    </MainLayout>
  );
};

export default ProTableAssessmentManagementPage;