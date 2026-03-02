import { useMemo, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@uidotdev/usehooks";

import { ServerDataTable } from "@/components/data_table/ServerDataTable";
import { getColumns } from "./column";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import ConfirmDialog from "@/components/ui/confirmdialog";
import { FacetedFilter } from "@/components/FacedFilter";
import EntityImportExportButton from "@/components/data_table/button/EntityImportExportBtn";

import { locationApi } from "@/api/locationApi";
import type {
  Location,
  CreateLocationRequest,
  UpdateLocationRequest,
} from "@/types/location";
import { LocationForm } from "./form";
import { useGetAllLocations } from "./queries";
import { useRoleSwitch } from "@/contexts/RoleSwitchContext";
import {
  useImportLocation,
  useExportLocation,
  useDownloadLocationTemplate,
} from "./services/mutations";
import { MapPin, Home, Hash, ToggleLeft, Calendar } from "lucide-react";
import type { ComponentType, SVGProps, ReactNode } from "react";
import { useSortParam } from "@/hooks/useSortParam";

/* ===================== DETAIL ROW ===================== */
const DetailRow = ({
  icon: Icon,
  label,
  value,
  isBadge = false,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value?: ReactNode;
  isBadge?: boolean;
}) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
      <Icon className="w-4 h-4 text-gray-500" /> {label}
    </label>
    <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 min-h-[42px] flex items-center">
      {isBadge ? (
        value === "ACTIVE" ? (
          <Badge className="bg-green-100 text-green-700">Active</Badge>
        ) : (
          <Badge variant="destructive">Inactive</Badge>
        )
      ) : (
        value || <span className="text-gray-400 italic">No data</span>
      )}
    </div>
  </div>
);

/* ===================== MAIN ===================== */
export default function LocationsTable() {
  /* ---------- permissions ---------- */
  const { activePermissions } = useRoleSwitch();
  const permissions = activePermissions || [];

  const hasPermission = (permission: string) =>
    permissions.includes(permission);

  const canCreate = hasPermission("LOCATION_CREATE");
  const canUpdate = hasPermission("LOCATION_UPDATE");
  const canDelete = hasPermission("LOCATION_DELETE");
  const canImport = hasPermission("LOCATION_IMPORT");
  const canExport = hasPermission("LOCATION_EXPORT");

  /* ---------- state ---------- */
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [viewingLocation, setViewingLocation] = useState<Location | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(
    null,
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const statusParam =
    statusFilter.length === 1
      ? (statusFilter[0] as "ACTIVE" | "INACTIVE")
      : undefined;

  const queryClient = useQueryClient();

  const sortParam = useSortParam(sorting, "createdAt,desc")

  /* ---------- query ---------- */
  const {
    data: tableData,
    isLoading,
    isFetching,
  } = useGetAllLocations({
    page: pageIndex,
    pageSize,
    sort: sortParam,
    keyword: debouncedSearch,
    status: statusParam ?? "",
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

  /* ---------- columns ---------- */
  const columns = useMemo(
    () =>
      getColumns({
        onView: setViewingLocation,
        onEdit: canUpdate
          ? (location) => {
              setEditingLocation(location);
              setIsFormOpen(true);
            }
          : undefined,
        onDelete: canDelete ? setDeletingLocation : undefined,
      }),
    [canUpdate, canDelete],
  );

  /* ---------- invalidate ---------- */
  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["locations"] });
  };

  /* ---------- CRUD ---------- */
  const handleCreate = async (
    formData: CreateLocationRequest | UpdateLocationRequest,
  ) => {
    try {
      await locationApi.createLocation(formData as CreateLocationRequest);
      toast.success("Location created successfully");
      setIsFormOpen(false);
      await invalidateAll();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create location");
    }
  };

  const handleUpdate = async (
    formData: CreateLocationRequest | UpdateLocationRequest,
  ) => {
    if (!editingLocation?.id) return;
    try {
      await locationApi.updateLocation(
        editingLocation.id,
        formData as UpdateLocationRequest,
      );
      toast.success("Location updated successfully");
      setIsFormOpen(false);
      setEditingLocation(null);
      await invalidateAll();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update location");
    }
  };

  const handleDelete = async () => {
    if (!deletingLocation) return;
    try {
      await locationApi.deleteLocation(deletingLocation.id);
      toast.success("Location deleted successfully");
      await invalidateAll();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete location");
    } finally {
      setDeletingLocation(null);
    }
  };

  /* ===================== RENDER ===================== */
  return (
    <div className="relative space-y-4 h-full flex-1">
      <ServerDataTable<Location, unknown>
        columns={columns as ColumnDef<Location, unknown>[]}
        data={safeTableData.items}
        isLoading={isLoading}
        isFetching={isFetching}
        pageIndex={safeTableData.page}
        pageSize={safeTableData.pageSize}
        totalPage={safeTableData.totalPages}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        isSearch
        searchPlaceholder="location name"
        onSearchChange={setSearchValue}
        sorting={sorting}
        onSortingChange={setSorting}
        headerActions={
          (canCreate || canImport || canExport) && (
            <div className="flex gap-2">
              {(canImport || canExport) && (
                <EntityImportExportButton
                  title="Locations"
                  useImportHook={useImportLocation}
                  useExportHook={useExportLocation}
                  useTemplateHook={useDownloadLocationTemplate}
                />
              )}

              {canCreate && (
                <Button
                  onClick={() => {
                    setEditingLocation(null);
                    setIsFormOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add New Location
                </Button>
              )}
            </div>
          )
        }
        facetedFilters={
          <div>
            <FacetedFilter
              title="Status"
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
              ]}
              value={statusFilter}
              setValue={setStatusFilter}
              multiple={false}
            />
          </div>
        }
      />

      {/* ===== Create / Update ===== */}
      <LocationForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingLocation(null);
        }}
        onSubmit={editingLocation ? handleUpdate : handleCreate}
        initialData={editingLocation}
      />

      {/* ===== Delete Confirmation ===== */}
      <ConfirmDialog
        open={!!deletingLocation}
        title="Delete Location"
        description={`Are you sure you want to delete "${deletingLocation?.name}"?`}
        onCancel={() => setDeletingLocation(null)}
        onConfirm={() => void handleDelete()}
      />

      {/* ===== View detail ===== */}
      <Dialog
        open={!!viewingLocation}
        onOpenChange={() => setViewingLocation(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location Details
            </DialogTitle>
            <DialogDescription>{viewingLocation?.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <DetailRow icon={Hash} label="ID" value={viewingLocation?.id} />
            <DetailRow
              icon={MapPin}
              label="Location Name"
              value={viewingLocation?.name}
            />
            <DetailRow
              icon={Home}
              label="Address"
              value={viewingLocation?.address}
            />
            <DetailRow
              icon={MapPin}
              label="Province"
              value={viewingLocation?.provinceName}
            />
            <DetailRow
              icon={MapPin}
              label="Commune"
              value={viewingLocation?.communeName}
            />
            <DetailRow
              icon={ToggleLeft}
              label="Status"
              value={viewingLocation?.status}
              isBadge
            />
            <DetailRow
              icon={Calendar}
              label="Created At"
              value={
                viewingLocation?.createdAt
                  ? new Date(viewingLocation.createdAt).toLocaleString()
                  : "-"
              }
            />
          </div>

          <DialogFooter>
            <Button onClick={() => setViewingLocation(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
