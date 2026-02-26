import { useEffect, useState } from 'react';
import { Button, Spin, Empty, message, Modal } from 'antd';
import { courseApi } from '../../api/courseApi';
import type { CourseObjective } from '../../types/courseObjective';
import AddObjectiveDrawer from './AddObjectiveDrawer.tsx';
import EditObjectiveDrawer from './EditObjectiveDrawer.tsx';
import ActionBtn from "@/components/data_table/ActionBtn";
import { Pencil, Trash } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data_table/DataTable";
import { Eye } from "lucide-react";
import ViewObjectiveDrawer from './ViewObjectivesDrawer.tsx';
import { ImportExportActions } from "@/components/import-export/ImportExportActions";
import { BaseImportModal } from "@/components/import-export/BaseImportModal";
interface Props {
    courseId: string;
}

const CourseObjectivesTab = ({ courseId }: Props) => {
    const [objectives, setObjectives] = useState<CourseObjective[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedObjective, setSelectedObjective] =
        useState<CourseObjective | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const fetchObjectives = async () => {
        if (!courseId) return;
        try {
            setLoading(true);
            const data = await courseApi.getObjectivesByCourse(courseId);
            setObjectives(data);
        } catch (err) {
            message.error('Failed to load objectives');
        } finally {
            setLoading(false);
        }
    };

    const columns: ColumnDef<CourseObjective>[] = [
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "description",
            header: "Description",
        },
        {
            id: "actions",
            header: "Actions",
            enableSorting: false,
            enableHiding: false,
            cell: ({ row }) => {
                const objective = row.original;

                return (
                    <div className="flex gap-2">
                        <ActionBtn
                            icon={<Eye size={16} />}
                            tooltipText="View"
                            onClick={() => handleView(objective)}
                        />

                        <ActionBtn
                            icon={<Pencil size={16} />}
                            tooltipText="Edit"
                            onClick={() => handleEdit(objective)}
                        />

                        <ActionBtn
                            icon={<Trash size={16} />}
                            tooltipText="Delete"
                            onClick={() => handleDelete(objective)}
                        />
                    </div>
                );
            },
        },
    ];

    const handleEdit = (record: any) => {
        setSelectedObjective(record);
        setEditOpen(true);
    };

    const handleDelete = (objective: CourseObjective) => {
        Modal.confirm({
            title: "Confirm delete",
            content: `Are you sure you want to delete "${objective.name}"? This action cannot be undone.`,
            okText: "Delete",
            okType: "danger",
            cancelText: "Cancel",

            async onOk() {
                try {
                    await courseApi.deleteObjective(courseId, objective.id);
                    message.success("Deleted successfully");
                    fetchObjectives();
                } catch (error) {
                    message.error("Delete failed");
                }
            },
        });
    };

    const handleView = (objective: CourseObjective) => {
        setSelectedObjective(objective);
        setDetailOpen(true);
    };

    const downloadBlob = (blob: Blob, filename: string) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleExport = async () => {
        try {
            const blob = await courseApi.exportObjectives(courseId);
            downloadBlob(blob, "objectives.xlsx");
            message.success("Export successful");
        } catch {
            message.error("Export failed");
        }
    };

    useEffect(() => {
        fetchObjectives();
    }, [courseId]);

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>Course Objectives</h3>

                <div style={{ display: "flex", gap: 8 }}>
                    <ImportExportActions
                        onImportClick={() => setImportOpen(true)}
                        onExportClick={handleExport}
                    />

                    <Button type="primary" onClick={() => setOpen(true)}>
                        Add Objective
                    </Button>
                </div>
            </div>

            {loading ? (
                <Spin />
            ) : objectives.length === 0 ? (
                <Empty description="No objectives yet" />
            ) : (
                <DataTable
                    columns={columns}
                    data={objectives}
                    isLoading={loading}
                    isSearch
                    searchValue={["name", "description"]}
                    searchPlaceholder="name"
                />
            )}

            <AddObjectiveDrawer
                open={open}
                onClose={() => setOpen(false)}
                courseId={courseId}
                onSuccess={fetchObjectives}
            />
            <EditObjectiveDrawer
                open={editOpen}
                onClose={() => setEditOpen(false)}
                courseId={courseId}
                objective={selectedObjective}
                onSuccess={fetchObjectives}
            />
            <ViewObjectiveDrawer
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                objective={selectedObjective}
            />

            <BaseImportModal
                open={importOpen}
                onClose={() => setImportOpen(false)}
                onSuccess={fetchObjectives}
                title="Import Objectives"
                description="Download template, fill in data, then upload to import."
                templateFileName="objective_template.xlsx"
                onDownloadTemplate={async () => {
                    return await courseApi.downloadObjectiveTemplate(courseId);
                }}
                onImport={async (file) => {
                    await courseApi.importObjectives(courseId, file);
                }}
            />
        </>
    );
};

export default CourseObjectivesTab;