import { TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { TooltipWrapper } from "@/components/TooltipWrapper";
import { TruncatedText } from "@/components/datatable/common/TruncatedText";
import type { FieldSchema } from "@/types/common/datatable";
import { OverflowBadges } from "./OverflowBadges";
import { formatDateValue } from "./dateFormat";

// Re-export for backward compatibility
export type { DateFormatKey } from "./dateFormat";
export { DATE_FORMAT_CYCLE, DATE_FORMAT_LABELS, formatDateValue } from "./dateFormat";
export { OverflowBadges } from "./OverflowBadges";

interface CellRendererProps {
  field: FieldSchema;
  value: any;
  relationOptions?: Record<string, any[]>;
  onBooleanToggle?: (fieldName: string, newValue: boolean) => void;
  dateFormat?: import("./dateFormat").DateFormatKey;
}

export function CellRenderer({
  field,
  value,
  relationOptions = {},
  onBooleanToggle,
  dateFormat,
}: CellRendererProps) {
  if (field.type === "boolean") {
    const labels = field.booleanLabels || { true: "Yes", false: "No" };
    const label = value ? labels.true : labels.false;
    return (
      <TableCell>
        <TooltipWrapper content={label}>
          <div className="inline-flex">
            <Switch
              checked={!!value}
              onCheckedChange={(checked) =>
                onBooleanToggle?.(field.name, checked)
              }
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-primary/40"
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
          {matched.length > 0 ? (
            <OverflowBadges
              items={matched}
              labelField={labelField}
              valueField={valueField}
            />
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
      );
    }

    const matched = options.find(
      (opt) => opt[valueField]?.toString() === value?.toString()
    );
    const displayText = matched ? matched[labelField] : (value ?? "—");
    return (
      <TableCell>
        <TruncatedText content={String(displayText)} bold={field.bold} />
      </TableCell>
    );
  }

  // Handle arrays (like question options)
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <TableCell>
          <span className="text-muted-foreground">—</span>
        </TableCell>
      );
    }

    // Check if it's an array of objects (like question options)
    const firstItem = value[0];
    if (typeof firstItem === "object" && firstItem !== null) {
      // For question options, show count with tooltip of contents
      if ("content" in firstItem) {
        const optionsText = value
          .map((opt: any, idx: number) =>
            `${String.fromCharCode(65 + idx)}. ${opt.content}${opt.correct ? " ✓" : ""}`
          )
          .join("\n");

        return (
          <TableCell>
            <TooltipWrapper content={optionsText}>
              <span className="text-muted-foreground cursor-help">
                {value.length} option{value.length !== 1 ? "s" : ""}
              </span>
            </TooltipWrapper>
          </TableCell>
        );
      }
    }

    // Array of primitives
    return (
      <TableCell>
        <TruncatedText content={value.join(", ")} bold={field.bold} />
      </TableCell>
    );
  }

  const displayValue = value ?? "—";
  const displayStr =
    field.type === "date" && value
      ? formatDateValue(value, dateFormat)
      : String(displayValue);

  return (
    <TableCell>
      <TruncatedText content={displayStr} bold={field.bold} />
    </TableCell>
  );
}
