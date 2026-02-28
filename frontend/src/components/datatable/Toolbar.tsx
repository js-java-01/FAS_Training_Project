import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  DatabaseBackup,
  Filter,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import ActionButton from "./ActionButton";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { DataIOModal } from "./DataIOModal";
import { Filters } from "./Filters";
import { ImportResultModal } from "./ImportResultModal";
import type { ImportResult } from "@/types";

interface ToolbarProps {
  table: any;
  headerActions?: React.ReactNode;
}

export function Toolbar({
  table,
  headerActions,
}: ToolbarProps) {
  const { schema } = table;

  const [dataIOOpen, setDataIOOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasFilters = schema.fields.some((f: any) => f.filterable);
  const activeFilterCount = Object.keys(table.filters || {}).filter(
    (key) => table.filters[key] !== undefined && table.filters[key] !== ""
  ).length;

  const handleImportSuccess = (result: ImportResult) => {
    setImportResult(result);
    setResultOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      setBulkDeleteLoading(true);
      await table.bulkDelete();
      setBulkDeleteOpen(false);
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_auto] grid-cols-1 items-center gap-2 w-full">
      <div className="flex flex-col lg:flex-row justify-start items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full !outline-none lg:w-28">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {schema.fields
              .filter((field: any) => field.hideable !== false)
              .map((field: any) => (
                <DropdownMenuCheckboxItem
                  key={field.name}
                  className="capitalize"
                  checked={table.columnVisibility[field.name] !== false}
                  onCheckedChange={(value) => {
                    table.toggleFieldVisibility(field.name, value);
                  }}
                >
                  {field.label ?? field.name}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="relative w-full lg:w-[420px]">
          <Search
            size={16}
            className="absolute text-gray-500 top-[10px] left-2"
          />
          <Input
            placeholder="Search..."
            className="pl-8 w-full"
            value={table.search || ""}
            onChange={(e) => table.setSearch(e.target.value)}
          />
        </div>

        {hasFilters && (
          <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
            <PopoverTrigger asChild>
              <div>
                <ActionButton
                  onClick={() => setFiltersOpen((prev) => !prev)}
                  tooltip="Filter data"
                  title="Filters"
                  variant="outline"
                  icon={
                    <span className="flex items-center gap-1.5">
                      <Filter size={14} />
                      {activeFilterCount > 0 && (
                        <Badge className="h-5 min-w-5 px-1 text-xs rounded-full">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </span>
                  }
                />
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto max-w-[90vw] p-0"
              align="start"
            >
              <div className="p-3 border-b flex items-center justify-between gap-4">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Filter size={14} />
                  Filter by
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {activeFilterCount} active
                    </Badge>
                  )}
                </span>
                <div className="flex items-center gap-1">
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground"
                      onClick={() => table.clearFilters?.()}
                    >
                      Clear all
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setFiltersOpen(false)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              </div>
              <div className="p-3 flex flex-wrap gap-2">
                <Filters table={table} />
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="flex flex-col lg:flex-row justify-end items-center gap-2">
        {headerActions}

        {table.selected?.length > 0 && (
          <ActionButton
            onClick={() => setBulkDeleteOpen(true)}
            tooltip={`Delete ${table.selected.length} selected rows`}
            title="Delete"
            variant="destructive"
            icon={<Trash2 size={16} />}
          />
        )}

        <ActionButton
          onClick={() => setDataIOOpen(true)}
          tooltip="Import & Export data"
          title="Import / Export"
          variant="secondary"
          icon={<DatabaseBackup size={16} />}
        />

        <ActionButton
          onClick={() => table.openCreate()}
          tooltip="Create new data"
          title="Create"
          variant="default"
          icon={<Plus size={16} />}
        />

        <DataIOModal
          open={dataIOOpen}
          onOpenChange={setDataIOOpen}
          table={table}
          onImportSuccess={handleImportSuccess}
        />

        <ImportResultModal
          open={resultOpen}
          onOpenChange={setResultOpen}
          result={importResult}
        />

        <ConfirmDeleteModal
          open={bulkDeleteOpen}
          onOpenChange={setBulkDeleteOpen}
          onConfirm={handleBulkDeleteConfirm}
          loading={bulkDeleteLoading}
          title="Delete Selected Items"
          description={`Are you sure you want to delete ${table.selected?.length || 0} selected items? This action cannot be undone.`}
        />
      </div>
    </div>
  );
}
