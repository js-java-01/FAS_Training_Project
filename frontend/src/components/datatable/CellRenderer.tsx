import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { TooltipWrapper } from "@/components/TooltipWrapper";
import type { FieldSchema } from "@/types/common/datatable";

interface CellRendererProps {
  field: FieldSchema;
  value: any;
  relationOptions?: Record<string, any[]>;
  onBooleanToggle?: (fieldName: string, newValue: boolean) => void;
}

export function CellRenderer({ field, value, relationOptions = {}, onBooleanToggle }: CellRendererProps) {
  if (field.type === "boolean") {
    const labels = field.booleanLabels || { true: "Yes", false: "No" };
    const label = value ? labels.true : labels.false;
    return (
      <TableCell>
        <TooltipWrapper content={label}>
          <div className="inline-flex">
            <Switch
              checked={!!value}
              onCheckedChange={(checked) => onBooleanToggle?.(field.name, checked)}
              className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-400"
            />
          </div>
        </TooltipWrapper>
      </TableCell>
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
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {matched.length > 0
              ? matched.map((m: any) => (
                  <Badge
                    key={m[valueField]}
                    variant="secondary"
                    className="text-xs"
                  >
                    {m[labelField]}
                  </Badge>
                ))
              : <span className="text-muted-foreground">—</span>}
          </div>
        </TableCell>
      );
    }

    const matched = options.find(
      (opt) => opt[valueField]?.toString() === value?.toString()
    );
    return (
      <TableCell>
        {matched ? matched[labelField] : (value ?? "—")}
      </TableCell>
    );
  }

  return <TableCell>{value}</TableCell>;
}
