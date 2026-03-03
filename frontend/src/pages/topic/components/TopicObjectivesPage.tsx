// TopicObjectivesPage.tsx

import { useState } from "react";
import { getObjectiveColumns } from "@/pages/topic/components/objectiveColumns";
import { useGetTopicObjectives } from "@/pages/topic/services/queries";
import { useDeleteObjective, useUpdateObjective, useCreateObjective, useDownloadObjectiveTemplate, useExportObjectives, useImportObjectives } from "@/pages/topic/services/mutations";
import type { TopicObjective } from "@/types/topicObjective";
import { DataTable } from "@/components/data_table/DataTable";
import { ObjectiveForm } from "@/components/ui/ObjectiveForm";
import EntityImportExportButton from "@/components/data_table/button/EntityImportExportBtn";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { Code } from "lucide-react";
interface TopicObjectivesPageProps {
    topicId: string;
}
export default function TopicObjectivesPage({ topicId }: TopicObjectivesPageProps) {



    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [open, setOpen] = useState(false);
    const [selectedObjective, setSelectedObjective] =
        useState<TopicObjective | null>(null);
    const [keyword, setKeyword] = useState("");
    const { data, isLoading } = useGetTopicObjectives(topicId!, {
        page: pageIndex,
        pageSize,
        keyword,
    });
    const createMutation = useCreateObjective(topicId!);
    const updateMutation = useUpdateObjective(topicId!);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<TopicObjective | null>(null);
    const deleteMutation = useDeleteObjective(topicId!);
    const handleDelete = (row: TopicObjective) => {
        setDeleteTarget(row);
        setDeleteOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!deleteTarget) return;

        deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => {
                setDeleteOpen(false);
                setDeleteTarget(null);
            },
        });
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
                    isSearch
                    searchValue={["name", "details"]}
                    onSearchChange={(value) => {
                        setKeyword(value);
                        setPageIndex(0);
                    }}
                    searchPlaceholder="name"
                />
            </div>

            <ObjectiveForm
                open={open}
                onClose={() => setOpen(false)}
                showStatus={false} // Topic không có status
                loading={createMutation.isPending || updateMutation.isPending}
                initialData={
                    selectedObjective
                        ? {
                            code: selectedObjective.code,
                            name: selectedObjective.name,
                            description: selectedObjective.details ?? "", // map details → description
                        }
                        : null
                }
                onSubmit={(formData) => {
                    const payload = {
                        code: formData.code,
                        name: formData.name,
                        details: formData.description, // map ngược lại description → details
                    };

                    if (selectedObjective) {
                        updateMutation.mutate(
                            {
                                objectiveId: selectedObjective.id,
                                payload,
                            },
                            {
                                onSuccess: () => {
                                    setOpen(false);
                                },
                            }
                        );
                    } else {
                        createMutation.mutate(payload, {
                            onSuccess: () => {
                                setOpen(false);
                            },
                        });
                    }
                }}
            />

            <ConfirmDeleteModal
                open={deleteOpen}
                message={
                    <>
                        Are you sure you want to delete "
                        <strong>{deleteTarget?.name}</strong>"? This action cannot be undone.
                    </>
                }
                onConfirm={handleDeleteConfirm}
                onCancel={() => {
                    setDeleteOpen(false);
                    setDeleteTarget(null);
                }}
            />


        </>
    );
}