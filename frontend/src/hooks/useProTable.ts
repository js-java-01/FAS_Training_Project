import {
  DefaultPagination,
  type EntitySchema,
  type FileFormat,
  type ImportResult,
  type Pagination,
} from "@/types";
import { downloadBlob, getFilenameFromHeader } from "@/utils/dataio.utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export type SortDirection = "asc" | "desc" | null;

export interface SortState {
  field: string | null;
  direction: SortDirection;
}

const parseSortString = (sort?: string): SortState => {
  if (!sort) return { field: null, direction: null };
  const [field, dir] = sort.split(",");
  return { field, direction: (dir as SortDirection) || "asc" };
};

const buildSortString = (field: string | null, direction: SortDirection): string | undefined => {
  if (!field || !direction) return undefined;
  return `${field},${direction}`;
};

export function useProTable(api: any, schema: EntitySchema) {
  const qc = useQueryClient();

  const [pagination, setPagination] = useState<Pagination>(DefaultPagination);
  const [sortState, setSortState] = useState<SortState>(() => parseSortString(DefaultPagination.sort));
  const [filters, setFilters] = useState<any>({});
  const [search, setSearch] = useState<string>("")

  const [selected, setSelected] = useState<any[]>([]);

  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    schema.fields.forEach((field) => {
      initial[field.name] = field.visible !== false;
    });
    return initial;
  });

  const visibleFields = schema.fields.filter(
    (field) => columnVisibility[field.name] !== false
  );

  const toggleFieldVisibility = (fieldName: string, visible: boolean) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [fieldName]: visible,
    }));
  };

  const toggleSort = (fieldName: string) => {
    setSortState((prev) => {
      if (prev.field !== fieldName) {
        return { field: fieldName, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { field: fieldName, direction: "desc" };
      }
      if (prev.direction === "desc") {
        return { field: null, direction: null };
      }
      return { field: fieldName, direction: "asc" };
    });
  };

  const currentSort = buildSortString(sortState.field, sortState.direction);

  const queryKey = [
    schema.entityName,
    pagination.page,
    pagination.size,
    currentSort,
    filters,
    search,
  ];

  const query = useQuery({
    queryKey,
    queryFn: () => api.getPage({ ...pagination, sort: currentSort }, search, filters),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: [schema.entityName] });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.create(data),
    onSuccess: () => {
      invalidate();
      setEditingRow(null);
      setFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => api.update(id, data),
    onSuccess: () => {
      invalidate();
      setEditingRow(null);
      setFormOpen(false);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: any) => api.delete(id),
    onSuccess: invalidate,
  });

  const importMutation = useMutation<ImportResult, any, File>({
    mutationFn: api.import,
    onSuccess: invalidate,
  });

  const exportFile = async (format: FileFormat) => {
    const res = await api.export(format);

    const contentDisposition = res.headers["content-disposition"];
    const filename = getFilenameFromHeader(contentDisposition);

    const contentType =
      format === "EXCEL"
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : format === "CSV"
          ? "text/csv"
          : "application/pdf";

    const blob = new Blob([res.data], { type: contentType });

    downloadBlob(blob, filename || undefined);
  };

  const openCreate = () => {
    setEditingRow(null);
    setFormOpen(true);
  };

  const openEdit = (row: any) => {
    setEditingRow(row);
    setFormOpen(true);
  };

  const bulkDelete = () => {
    selected.forEach((id) => removeMutation.mutate(id));
    setSelected([]);
  };

  return {
    schema,

    data: query.data?.content ?? [],
    total: query.data?.totalElements ?? 0,
    loading: query.isLoading,
    isFetching: query.isFetching,

    page: pagination.page,
    size: pagination.size,
    sortState,
    toggleSort,
    setPage: (page: number) => setPagination((prev) => ({ ...prev, page })),
    setSize: (size: number) => setPagination((prev) => ({ ...prev, size })),

    filters,
    setFilters,
    clearFilters: () => setFilters({}),
    search,
    setSearch,

    selected,
    setSelected,

    editingRow,
    isFormOpen,
    setFormOpen,

    columnVisibility,
    visibleFields,
    toggleFieldVisibility,

    openCreate,
    openEdit,

    create: createMutation.mutate,
    update: updateMutation.mutate,
    remove: removeMutation.mutate,
    bulkDelete,

    isSubmitting: createMutation.isPending || updateMutation.isPending,

    importFile: importMutation.mutateAsync,
    exportFile,
  };
}
