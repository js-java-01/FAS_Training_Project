import { Switch } from "@/components/ui/switch";
import { TruncatedText } from "@/components/datatable/common/TruncatedText";
import { BadgeList } from "@/components/datatable/common/BadgeList";
import type { FieldSchema } from "@/types/common/datatable";

interface CardFieldValueProps {
  field: FieldSchema;
  value: any;
  relationOptions: Record<string, any[]>;
  onBooleanToggle?: (fieldName: string, newValue: boolean) => void;
}

const MAX_CARD_BADGES = 3;

export function CardFieldValue({
  field,
  value,
  relationOptions,
  onBooleanToggle,
}: CardFieldValueProps) {
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
        <BadgeList
          items={matched}
          labelField={labelField}
          valueField={valueField}
          maxVisible={MAX_CARD_BADGES}
        />
      );
    }

    const matched = options.find(
      (opt) => opt[valueField]?.toString() === value?.toString()
    );
    const displayText = matched ? matched[labelField] : (value ?? "—");
    return (
      <TruncatedText
        content={String(displayText)}
        bold={field.bold}
        className="text-sm"
      />
    );
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
      return (
        <TruncatedText
          content={formatted}
          bold={field.bold}
          className="text-sm"
        />
      );
    } catch {
      return (
        <TruncatedText
          content={String(value)}
          bold={field.bold}
          className="text-sm"
        />
      );
    }
  }

  const displayValue = String(value ?? "—");
  return (
    <TruncatedText
      content={displayValue}
      bold={field.bold}
      className="text-sm"
    />
  );
}
