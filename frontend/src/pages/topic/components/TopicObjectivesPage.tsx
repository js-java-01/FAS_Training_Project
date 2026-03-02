// TopicObjectivesPage.tsx

import { useState } from "react";
import { getObjectiveColumns } from "@/pages/topic/components/objectiveColumns";
import { useGetTopicObjectives } from "@/pages/topic/services/queries";
import { useDeleteObjective, useUpdateObjective, useCreateObjective, useDownloadObjectiveTemplate, useExportObjectives, useImportObjectives } from "@/pages/topic/services/mutations";
import type { TopicObjective } from "@/types/topicObjective";
import { DataTable } from "@/components/data_table/DataTable";
import { ObjectiveForm } from "./ObjectiveForm";
import EntityImportExportButton from "@/components/data_table/button/EntityImportExportBtn";
interface TopicObjectivesPageProps {
    topicId: string;
}
export default function TopicObjectivesPage({ topicId }: TopicObjectivesPageProps) {



    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [open, setOpen] = useState(false);
    const [selectedObjective, setSelectedObjective] =
        useState<TopicObjective | null>(null);
    const { data, isLoading } = useGetTopicObjectives(topicId!, {
        page: pageIndex,
        pageSize,
    });
    const createMutation = useCreateObjective(topicId!);
    const updateMutation = useUpdateObjective(topicId!);

    const deleteMutation = useDeleteObjective(topicId!);

    const handleDelete = (row: TopicObjective) => {
        if (!confirm("Are you sure you want to delete this objective?")) return;

        deleteMutation.mutate(row.id);
    };

    const handleEdit = (row: TopicObjective) => {
        setSelectedObjective(row);
        setOpen(true);
    };

    const columns = getObjectiveColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
    });

    return (
        <>
            <div className="p-6">
                <div className="flex justify-end items-center gap-2 mb-4">
                    <EntityImportExportButton
                        title="Topic Objectives"
                        useImportHook={() => useImportObjectives(topicId)}
                        useExportHook={() => useExportObjectives(topicId)}
                        useTemplateHook={() =>
                            useDownloadObjectiveTemplate(topicId)
                        }
                    />

                    <button
                        onClick={() => {
                            setSelectedObjective(null);
                            setOpen(true);
                        }}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Add Objective
                    </button>
                </div>

                <DataTable
                    columns={columns}
                    data={data?.items ?? []}
                    isLoading={isLoading}
                    manualPagination
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    totalPage={data?.pagination.totalPages ?? 0}
                    onPageChange={setPageIndex}
                    onPageSizeChange={setPageSize}
                />
            </div>

            <ObjectiveForm
                open={open}
                onClose={() => setOpen(false)}
                initialData={selectedObjective}
                loading={createMutation.isPending || updateMutation.isPending}
                onSubmit={(formData) => {
                    if (selectedObjective) {
                        updateMutation.mutate(
                            {
                                objectiveId: selectedObjective.id,
                                payload: formData,
                            },
                            {
                                onSuccess: () => {
                                    setOpen(false);
                                },
                            }
                        );
                    } else {
                        createMutation.mutate(formData, {
                            onSuccess: () => {
                                setOpen(false);
                            },
                        });
                    }
                }}
            />


        </>
    );
}