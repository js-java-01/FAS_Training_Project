import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Plus
} from 'lucide-react';
import React, { useState, useMemo, useCallback } from 'react';
import type { ColumnDef, SortingState } from "@tanstack/react-table";

import { questionTagApi } from '../../api/service/assessment/questionTagApi';
import { PermissionGate } from '../../components/PermissionGate';

import type { QuestionTagRequest, QuestionTag } from '../../types/feature/assessment/question-tag';

import { CreateQuestionTagModal } from './CreateQuestionTagModal';
import { DeleteQuestionTagDialog } from './DeleteQuestionTagDialog';
import { UpdateQuestionTagModal } from './UpdateQuestionTagModal';
import { ViewQuestionTagModal } from './ViewQuestionTagModal';

import { DataTable } from '@/components/data_table/DataTable';
import { getColumns } from './columns';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/useToast';

export const QuestionTagTable: React.FC = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // ========================================
    // State: Table Configuration
    // ========================================
    const [sortingClient, setSortingClient] = useState<SortingState>([]);
    const [keyword, setKeyword] = useState('');

    // ========================================
    // State: Modal Controls
    // ========================================
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedTag, setSelectedTag] = useState<QuestionTag | null>(null);

    // ========================================
    // Data Loading (Queries)
    // ========================================
    const { data: tagsResponse, isLoading, isFetching } = useQuery({
        queryKey: ['question-tags'],
        queryFn: () => questionTagApi.getPage({ page: 0, size: 1000 })
    });

    // Safe table data with defaults - extract items from paginated response
    const safeTableData = useMemo(() => {
        const items = tagsResponse?.items ?? [];
        // Client-side filtering based on keyword
        const filteredItems = keyword
            ? items.filter(tag =>
                tag.name.toLowerCase().includes(keyword.toLowerCase()) ||
                tag.description?.toLowerCase().includes(keyword.toLowerCase())
            )
            : items;
        return { items: filteredItems };
    }, [tagsResponse, keyword]);

    // ========================================
    // CRUD Mutations
    // ========================================
    const createMutation = useMutation({
        mutationFn: questionTagApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['question-tags'] });
            setShowCreateModal(false);
            toast({ variant: "success", title: "Success", description: "Question tag created successfully" });
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to create question tag" });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: QuestionTagRequest }) =>
            questionTagApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['question-tags'] });
            setShowUpdateModal(false);
            toast({ variant: "success", title: "Success", description: "Question tag updated successfully" });
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to update question tag" });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: questionTagApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['question-tags'] });
            setShowDeleteDialog(false);
            toast({ variant: "success", title: "Success", description: "Question tag deleted successfully" });
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to delete question tag" });
        }
    });

    // ========================================
    // Columns & Actions
    // ========================================
    const handleView = useCallback((row: QuestionTag) => {
        setSelectedTag(row);
        setShowViewModal(true);
    }, []);

    const handleEdit = useCallback((row: QuestionTag) => {
        setSelectedTag(row);
        setShowUpdateModal(true);
    }, []);

    const handleDelete = useCallback((row: QuestionTag) => {
        setSelectedTag(row);
        setShowDeleteDialog(true);
    }, []);

    const columns = useMemo(() => getColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete
    }), [handleView, handleEdit, handleDelete]);

    const headerActions = (
        <div className="flex gap-2">
            <PermissionGate permission="QUESTION_CREATE">
                <Button
                    size="sm"
                    onClick={() => setShowCreateModal(true)}
                    className="h-8 bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Tag
                </Button>
            </PermissionGate>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <DataTable<QuestionTag, unknown>
                columns={columns as ColumnDef<QuestionTag, unknown>[]}
                data={safeTableData.items}
                isLoading={isLoading}
                isFetching={isFetching}

                // Actions
                headerActions={headerActions}

                // Sorting
                sorting={sortingClient}
                onSortingChange={setSortingClient}
                manualSorting={false}

                // Search
                isSearch
                manualSearch
                searchPlaceholder="name"
                onSearchChange={setKeyword}
            />

            {/* Modals */}
            <CreateQuestionTagModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={(data) => createMutation.mutate(data)}
                isPending={createMutation.isPending}
            />

            <UpdateQuestionTagModal
                isOpen={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                tag={selectedTag}
                onSubmit={(id, data) => updateMutation.mutate({ id, data })}
                isPending={updateMutation.isPending}
            />

            <ViewQuestionTagModal
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                tag={selectedTag}
            />

            <DeleteQuestionTagDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                tag={selectedTag}
                onConfirm={() => selectedTag && deleteMutation.mutate(selectedTag.id)}
                isPending={deleteMutation.isPending}
            />
        </div>
    );
};
