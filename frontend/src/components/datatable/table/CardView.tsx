import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Eye, Pen, Trash2 } from "lucide-react";
import ActionButton from "../common/ActionButton";
import type { FieldSchema } from "@/types/common/datatable";

interface CardViewProps {
  table: any;
  onRowClick?: (row: any) => void;
  onView: (row: any) => void;
  onEdit: (row: any) => void;
  onDelete: (row: any) => void;
  onBooleanToggle: (id: any, fieldName: string, newValue: boolean) => void;
}

function CardFieldValue({
  field,
  value,
  relationOptions,
  onBooleanToggle,
}: {
  field: FieldSchema;
  value: any;
  relationOptions: Record<string, any[]>;
  onBooleanToggle?: (fieldName: string, newValue: boolean) => void;
}) {
  if (field.type === "boolean") {
    const labels = field.booleanLabels || { true: "Yes", false: "No" };
    const label = value ? labels.true : labels.false;
    return (
      <div className="flex items-center gap-2">
        <Switch
          checked={!!value}
          onCheckedChange={(checked) => onBooleanToggle?.(field.name, checked)}
          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-primary/40 scale-90"
        />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    );
  }

  if (field.type === "relation" && field.relation) {
    const options: any[] = relationOptions[field.name] ?? [];
    const { valueField, labelField, multiple } = field.relation;

    if (multiple && Array.isArray(value)) {
      const matched = value
        .map((v: any) =>
          options.find((opt) => opt[valueField]?.toString() === v?.toString())
        )
        .filter(Boolean);
      return (
        <div className="flex flex-wrap gap-1">
          {matched.length > 0
            ? matched.map((m: any) => (
                <Badge key={m[valueField]} variant="secondary" className="text-xs">
                  {m[labelField]}
                </Badge>
              ))
            : <span className="text-muted-foreground text-sm">—</span>}
        </div>
      );
    }

    const matched = options.find(
      (opt) => opt[valueField]?.toString() === value?.toString()
    );
    const displayText = matched ? matched[labelField] : (value ?? "—");
    return <span className="text-sm">{displayText}</span>;
  }

  if (field.type === "date" && value) {
    try {
      const formatted = new Date(value).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
      return <span className="text-sm">{formatted}</span>;
    } catch {
      return <span className="text-sm">{String(value)}</span>;
    }
  }

  return <span className="text-sm">{value ?? "—"}</span>;
}

export function CardView({
  table,
  onRowClick,
  onView,
  onEdit,
  onDelete,
  onBooleanToggle,
}: CardViewProps) {
  const { schema } = table;

  return (
    <div
      className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-3 overflow-y-auto transition-opacity ${
        table.isFetching ? "opacity-50" : ""
      }`}
    >
      {table.data?.map((row: any) => {
        const id = row[schema.idField];
        const isSelected = table.selected?.includes(id) || false;

        return (
          <Card
            key={id}
            className={`relative group cursor-pointer transition-all hover:shadow-md ${
              isSelected ? "ring-2 ring-primary" : ""
            }`}
            onClick={(e) => {
              const target = e.target as HTMLElement | null;
              if (target?.closest("button, a, input, label, [role=switch]")) return;
              onRowClick?.(row);
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2 space-y-0">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => {
                    table.setSelected((prev: any[]) =>
                      isSelected ? prev.filter((x) => x !== id) : [...prev, id]
                    );
                  }}
                  aria-label="Select card"
                />
                <span className="text-xs text-muted-foreground font-medium">
                  #{(table.page || 0) * (table.size || 10) + table.data.indexOf(row) + 1}
                </span>
              </div>
              <div className="flex gap-1">
                <ActionButton
                  onClick={() => onView(row)}
                  tooltip="View detail"
                  icon={<Eye size={10} className="text-gray-500" />}
                />
                <ActionButton
                  onClick={() => onEdit(row)}
                  tooltip="Edit"
                  icon={<Pen size={10} className="text-gray-500" />}
                />
                <ActionButton
                  onClick={() => onDelete(row)}
                  tooltip="Delete"
                  icon={<Trash2 size={10} className="text-red-500" />}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {table.visibleFields
                .filter((f: FieldSchema) => f.type !== "password")
                .map((f: FieldSchema) => (
                  <div key={f.name} className="flex items-start gap-2">
                    <span className="text-xs font-medium text-muted-foreground min-w-[80px] shrink-0 pt-0.5">
                      {f.label}
                    </span>
                    <CardFieldValue
                      field={f}
                      value={row[f.name]}
                      relationOptions={table.relationOptions}
                      onBooleanToggle={(fieldName, newValue) =>
                        onBooleanToggle(id, fieldName, newValue)
                      }
                    />
                  </div>
                ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
