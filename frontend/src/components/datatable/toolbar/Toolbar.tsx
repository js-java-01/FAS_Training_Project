import { ColumnToggle } from "./ColumnToggle";
import { FilterPopover } from "./FilterPopover";
import { SearchInput } from "./SearchInput";
import { ToolbarActions } from "./ToolbarActions";
import ActionButton from "../common/ActionButton";
import { ArrowUpDown } from "lucide-react";

interface ToolbarProps {
  table: any;
  headerActions?: React.ReactNode;
}

export function Toolbar({ table, headerActions }: ToolbarProps) {
  const { schema } = table;

  const hasFilters = schema.fields.some((f: any) => f.filterable);
  const activeFilterCount = Object.keys(table.filters || {}).filter(
    (key) => table.filters[key] !== undefined && table.filters[key] !== "",
  ).length;

  const hasSorts = table.sortState?.length > 0;

  return (
    <div className="grid lg:grid-cols-[1fr_auto] grid-cols-1 items-center gap-2 w-full">
      <div className="flex flex-col lg:flex-row justify-start items-center gap-2">
        <ColumnToggle
          schema={schema}
          columnVisibility={table.columnVisibility}
          toggleFieldVisibility={table.toggleFieldVisibility}
        />

        <FilterPopover
          table={table}
          hasFilters={hasFilters}
          activeFilterCount={activeFilterCount}
        />

        <SearchInput search={table.search} onSearchChange={table.setSearch} />

        {hasSorts && (
          <ActionButton
            onClick={() => table.clearSort()}
            tooltip={`Clear all sorts (${table.sortState.length})`}
            title={`Clear sort (${table.sortState.length})`}
            variant="outline"
            icon={<ArrowUpDown size={14} />}
          />
        )}
      </div>

      <ToolbarActions table={table} headerActions={headerActions} />
    </div>
  );
}
