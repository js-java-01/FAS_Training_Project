import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, X } from "lucide-react";
import { useState } from "react";
import ActionButton from "../common/ActionButton";
import { Filters } from "./Filters";

interface FilterPopoverProps {
  table: any;
  hasFilters: boolean;
  activeFilterCount: number;
}

export function FilterPopover({
  table,
  hasFilters,
  activeFilterCount,
}: FilterPopoverProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
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
      <PopoverContent className="w-auto max-w-[90vw] p-0" align="start">
        {hasFilters ? (
          <>
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
          </>
        ) : (
          <div className="p-4 flex flex-col items-center gap-2 text-muted-foreground">
            <Filter size={20} />
            <span className="text-sm">No filters available</span>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
