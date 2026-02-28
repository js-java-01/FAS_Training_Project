import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FieldSchema, FilterType } from "@/types/common/datatable";

interface FiltersProps {
  table: any;
}

function getFilterType(field: FieldSchema): FilterType {
  if (field.filterType) return field.filterType;
  
  switch (field.type) {
    case "boolean":
      return "boolean";
    case "select":
      return "select";
    case "date":
      return "dateRange";
    case "number":
      return "numberRange";
    default:
      return "text";
  }
}

function TextFilter({ field, value, onChange }: { 
  field: FieldSchema; 
  value: string; 
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Filter size={14} className="absolute text-gray-500 top-[10px] left-2" />
      <Input
        placeholder={`Filter ${field.label}...`}
        className="pl-8 w-40 h-9"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SelectFilter({ field, value, onChange }: {
  field: FieldSchema;
  value: any;
  onChange: (value: any) => void;
}) {
  const options = field.filterOptions || field.options || [];
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9 gap-2 !outline-none">
          <Filter size={14} className="text-gray-500" />
          {selectedOption ? selectedOption.label : field.label}
          <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-[320px] overflow-auto">
        <DropdownMenuRadioGroup
          value={value?.toString() || ""}
          onValueChange={(val) => onChange(val === "" ? undefined : val)}
        >
          <DropdownMenuRadioItem value="">
            All
          </DropdownMenuRadioItem>
          <DropdownMenuSeparator />
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value?.toString()}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BooleanFilter({ field, value, onChange }: {
  field: FieldSchema;
  value: boolean | undefined;
  onChange: (value: boolean | undefined) => void;
}) {
  const labels = field.booleanLabels || { true: "Yes", false: "No" };
  
  const displayValue = value === undefined 
    ? field.label 
    : value ? labels.true : labels.false;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9 gap-2 !outline-none">
          <Filter size={14} className="text-gray-500" />
          {displayValue}
          <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuRadioGroup
          value={value === undefined ? "" : value.toString()}
          onValueChange={(val) => {
            if (val === "") onChange(undefined);
            else onChange(val === "true");
          }}
        >
          <DropdownMenuRadioItem value="">All</DropdownMenuRadioItem>
          <DropdownMenuSeparator />
          <DropdownMenuRadioItem value="true">{labels.true}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="false">{labels.false}</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NumberRangeFilter({ field, value, onChange }: {
  field: FieldSchema;
  value: { min?: number; max?: number } | undefined;
  onChange: (value: { min?: number; max?: number } | undefined) => void;
}) {
  const hasValue = value?.min !== undefined || value?.max !== undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-9 gap-2 !outline-none">
          <Filter size={14} className="text-gray-500" />
          {hasValue 
            ? `${value?.min ?? "∞"} - ${value?.max ?? "∞"}`
            : field.label
          }
          <ChevronDown size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-3">
          <div className="text-sm font-medium">{field.label}</div>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Min"
              className="h-8"
              value={value?.min ?? ""}
              onChange={(e) => {
                const min = e.target.value ? Number(e.target.value) : undefined;
                onChange(min !== undefined || value?.max !== undefined 
                  ? { ...value, min } 
                  : undefined
                );
              }}
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder="Max"
              className="h-8"
              value={value?.max ?? ""}
              onChange={(e) => {
                const max = e.target.value ? Number(e.target.value) : undefined;
                onChange(value?.min !== undefined || max !== undefined 
                  ? { ...value, max } 
                  : undefined
                );
              }}
            />
          </div>
          {hasValue && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full"
              onClick={() => onChange(undefined)}
            >
              Clear
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function DateRangeFilter({ field, value, onChange }: {
  field: FieldSchema;
  value: { from?: string; to?: string } | undefined;
  onChange: (value: { from?: string; to?: string } | undefined) => void;
}) {
  const hasValue = value?.from || value?.to;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-9 gap-2 !outline-none">
          <Filter size={14} className="text-gray-500" />
          {hasValue 
            ? `${value?.from || "..."} - ${value?.to || "..."}`
            : field.label
          }
          <ChevronDown size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-3">
          <div className="text-sm font-medium">{field.label}</div>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-muted-foreground">From</label>
              <Input
                type="date"
                className="h-8"
                value={value?.from ?? ""}
                onChange={(e) => {
                  const from = e.target.value || undefined;
                  onChange(from || value?.to ? { ...value, from } : undefined);
                }}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">To</label>
              <Input
                type="date"
                className="h-8"
                value={value?.to ?? ""}
                onChange={(e) => {
                  const to = e.target.value || undefined;
                  onChange(value?.from || to ? { ...value, to } : undefined);
                }}
              />
            </div>
          </div>
          {hasValue && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full"
              onClick={() => onChange(undefined)}
            >
              Clear
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function Filters({ table }: FiltersProps) {
  const filterableFields = table.schema.fields.filter((f: FieldSchema) => f.filterable);

  if (filterableFields.length === 0) return null;

  const activeFilterCount = Object.keys(table.filters || {}).filter(
    (key) => table.filters[key] !== undefined && table.filters[key] !== ""
  ).length;

  const clearAllFilters = () => {
    table.setFilters({});
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {filterableFields.map((field: FieldSchema) => {
        const filterType = getFilterType(field);
        const value = table.filters?.[field.name];

        switch (filterType) {
          case "text":
            return (
              <TextFilter
                key={field.name}
                field={field}
                value={value}
                onChange={(val) =>
                  table.setFilters((prev: any) => ({
                    ...prev,
                    [field.name]: val || undefined,
                  }))
                }
              />
            );
          case "select":
            return (
              <SelectFilter
                key={field.name}
                field={field}
                value={value}
                onChange={(val) =>
                  table.setFilters((prev: any) => ({
                    ...prev,
                    [field.name]: val,
                  }))
                }
              />
            );
          case "boolean":
            return (
              <BooleanFilter
                key={field.name}
                field={field}
                value={value}
                onChange={(val) =>
                  table.setFilters((prev: any) => ({
                    ...prev,
                    [field.name]: val,
                  }))
                }
              />
            );
          case "numberRange":
            return (
              <NumberRangeFilter
                key={field.name}
                field={field}
                value={value}
                onChange={(val) =>
                  table.setFilters((prev: any) => ({
                    ...prev,
                    [field.name]: val,
                  }))
                }
              />
            );
          case "dateRange":
            return (
              <DateRangeFilter
                key={field.name}
                field={field}
                value={value}
                onChange={(val) =>
                  table.setFilters((prev: any) => ({
                    ...prev,
                    [field.name]: val,
                  }))
                }
              />
            );
          default:
            return null;
        }
      })}

      {/* Active filter badges */}
      {activeFilterCount > 0 && (
        <>
          <div className="h-6 w-px bg-border mx-1" />
          <Badge variant="secondary" className="gap-1">
            {activeFilterCount} active
            <button
              onClick={clearAllFilters}
              className="ml-1 hover:bg-muted rounded-full p-0.5"
            >
              <X size={12} />
            </button>
          </Badge>
        </>
      )}
    </div>
  );
}