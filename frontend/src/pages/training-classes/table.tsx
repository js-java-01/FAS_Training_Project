import { useMemo, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@uidotdev/usehooks";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { TrainingClass } from "@/types/trainingClass";
import { useGetAllTrainingClasses } from "./services/queries";
import { getColumns } from "./column";
import { TrainingClassForm } from "./form";
import { FacetedFilter } from "@/components/FacedFilter";
import { ServerDataTable } from "@/components/data_table/ServerDataTable";
import { ReviewActionModal } from "@/components/ReviewActionModal";
import { trainingClassApi } from "@/api/trainingClassApi";
import { useSortParam } from "@/hooks/useSortParam";
import { trainingClassKeys } from "./keys";
import { encodeRouteId } from "@/utils/routeIdCodec";

/* ======================================================= */

export default function TrainingClassesTable() {
    /* ===================== STATE ===================== */
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const [searchValue, setSearchValue] = useState("");
    const debouncedSearch = useDebounce(searchValue, 300);

    const [openForm, setOpenForm] = useState(false);
    const navigate = useNavigate();

    /* ---------- approve / reject ---------- */
    const [approveTarget, setApproveTarget] = useState<TrainingClass | null>(null);
    const [rejectTarget, setRejectTarget] = useState<TrainingClass | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    /* ---------- faceted filter ---------- */
    const [statusFilter, setStatusFilter] = useState<string[]>([]);

    /* ---------- filter param (server side) ---------- */
    const statusParam =
        statusFilter.length === 1 ? statusFilter[0] === "ACTIVE" : undefined;

    const queryClient = useQueryClient();

    /* ===================== SORT ===================== */
    const sortParam = useSortParam(sorting, "className,asc");

    /* ===================== DATA ===================== */
    const {
        data: tableData,
        isLoading,
        isFetching,
    } = useGetAllTrainingClasses({
        page: pageIndex,
        pageSize,
        sort: sortParam,
        keyword: debouncedSearch,
        isActive: statusParam,
    });

    const safeTableData = useMemo(
        () => ({
            items: tableData?.items ?? [],
            page: tableData?.pagination?.page ?? pageIndex,
            pageSize: tableData?.pagination?.pageSize ?? pageSize,
            totalPages: tableData?.pagination?.totalPages ?? 0,
            totalElements: tableData?.pagination?.totalElements ?? 0,
        }),
        [tableData, pageIndex, pageSize],
    );

    /* ===================== COLUMNS ===================== */
    const columns = useMemo(
        () =>
            getColumns({
                onNavigate: (row) => navigate(`/classes/${encodeRouteId("classes", row.id)}`, { state: { trainingClass: row } }),
                onApprove: (row) => setApproveTarget(row),
                onReject: (row) => setRejectTarget(row),
            }),
        [navigate],
    );

    /* ===================== HANDLERS ===================== */
    const invalidateAll = async () => {
        await queryClient.invalidateQueries({ queryKey: ["training-classes"] });
    };

    const handleSaved = async () => {
        toast.success("Class request submitted successfully");
        await invalidateAll();
        setOpenForm(false);
    };

    const handleApprove = async (reason: string) => {
        if (!approveTarget) return;
        setActionLoading(true);
        try {
            await trainingClassApi.approveClass(approveTarget.id, reason);
            toast.success(`Class "${approveTarget.className}" approved successfully`);
            await invalidateAll();
            await queryClient.invalidateQueries({ queryKey: trainingClassKeys.detail(approveTarget.id) });
            setApproveTarget(null); // Move hide after success to prevent flicker before refresh in optimistic scenarios
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (err as { message?: string })?.message ||
                "Failed to approve class";
            toast.error(msg);
        } finally {
            setActionLoading(false);
            // setApproveTarget(null); // Moved to try block to keep modal on error? No, typically hide or retry. Let's hide on success only or error.
            // On error, we usually want to let user retry or see what happened. But modal is simple.
            // I'll keep it hiding on close/cancel.
        }
    };

    const handleReject = async (reason: string) => {
        if (!rejectTarget) return;
        setActionLoading(true);
        try {
            await trainingClassApi.rejectClass(rejectTarget.id, reason);
            toast.success(`Class "${rejectTarget.className}" rejected`);
            await invalidateAll();
            await queryClient.invalidateQueries({ queryKey: trainingClassKeys.detail(rejectTarget.id) });
            setRejectTarget(null); // Hide on success
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (err as { message?: string })?.message ||
                "Failed to reject class";
            toast.error(msg);
        } finally {
            setActionLoading(false);
        }
    };

    /* ===================== RENDER ===================== */
    return (
        <div className="relative space-y-4 h-full flex-1">
            <ServerDataTable<TrainingClass, unknown>
                columns={columns as ColumnDef<TrainingClass, unknown>[]}
                data={safeTableData.items}
                isLoading={isLoading}
                isFetching={isFetching}

                /* PAGINATION */
                pageIndex={safeTableData.page}
                pageSize={safeTableData.pageSize}
                totalPage={safeTableData.totalPages}
                onPageChange={setPageIndex}
                onPageSizeChange={setPageSize}

                /* SEARCH */
                isSearch
                searchPlaceholder="class name or code"
                onSearchChange={setSearchValue}

                /* SORTING */
                sorting={sorting}
                onSortingChange={setSorting}

                /* ACTIONS */
                headerActions={
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setOpenForm(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Open Class Request
                        </Button>
                    </div>
                }

                facetedFilters={
                    <div>
                        <FacetedFilter
                            title="Status"
                            options={[
                                { value: "ACTIVE", label: "Active" },
                                { value: "INACTIVE", label: "Pending" },
                            ]}
                            value={statusFilter}
                            setValue={setStatusFilter}
                            multiple={false}
                        />
                    </div>
                }
            />

            <TrainingClassForm
                open={openForm}
                onClose={() => setOpenForm(false)}
                onSaved={handleSaved}
            />

            {/* ── Approve confirmation ── */}
            {approveTarget && (
                <ReviewActionModal
                    open={!!approveTarget}
                    title="Approve Training Request"
                    description="Please provide approval notes for this request."
                    label="Approval Note"
                    placeholder="Enter approval notes..."
                    confirmText="Approve"
                    variant="approve"
                    loading={actionLoading}
                    requireReason={true} // Screenshot shows *
                    onConfirm={handleApprove}
                    onCancel={() => setApproveTarget(null)}
                />
            )}

            {/* ── Reject confirmation ── */}
            {rejectTarget && (
                <ReviewActionModal
                    open={!!rejectTarget}
                    title="Reject Training Request"
                    description="Please provide a reason for rejecting this request."
                    label="Rejection Reason"
                    placeholder="Enter rejection reason..."
                    confirmText="Reject"
                    variant="destructive"
                    loading={actionLoading}
                    requireReason={true}
                    onConfirm={handleReject}
                    onCancel={() => setRejectTarget(null)}
                />
            )}
        </div>
    );
}
