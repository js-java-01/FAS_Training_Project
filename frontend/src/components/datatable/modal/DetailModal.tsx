import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { EntitySchema, FieldSchema } from "@/types/common/datatable";

interface DetailModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
  schema: EntitySchema;
  row: any;
  relationOptions?: Record<string, any[]>;
}

export function DetailModal({
  open,
  onClose,
  schema,
  row,
  relationOptions = {},
}: DetailModalProps) {
  if (!row) return null;

  const renderValue = (field: FieldSchema) => {
    const value = row[field.name];

    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">—</span>;
    }

    switch (field.type) {
      case "boolean": {
        const labels = field.booleanLabels || { true: "Yes", false: "No" };
        const colorClass = value
          ? (labels.trueColor || "bg-green-500 text-white")
          : (labels.falseColor || "bg-red-400 text-white");
        return (
          <Badge className={colorClass}>
            {value ? labels.true : labels.false}
          </Badge>
        );
      }

      case "relation": {
        const rel = field.relation;
        if (!rel) return String(value);
        const options: any[] = relationOptions[field.name] ?? [];

        if (rel.multiple && Array.isArray(value)) {
          const matched = value
            .map((v: any) =>
              options.find(
                (opt) => opt[rel.valueField]?.toString() === v?.toString()
              )
            )
            .filter(Boolean);
          return matched.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {matched.map((m: any) => (
                <Badge key={m[rel.valueField]} variant="secondary" className="text-xs">
                  {m[rel.labelField]}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        }

        const matched = options.find(
          (opt) => opt[rel.valueField]?.toString() === value?.toString()
        );
        return matched ? matched[rel.labelField] : String(value);
      }

      case "date": {
        try {
          const date = new Date(value);
          return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch {
          return String(value);
        }
      }

      default:
        return String(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Detail</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-1">
          <div className="grid gap-3">
            {schema.fields.filter((f) => f.type !== "password").map((field, index) => (
              <div key={field.name}>
                {index > 0 && <Separator className="mb-3" />}
                <div className="flex items-start gap-4">
                  <span className="text-sm font-medium text-muted-foreground min-w-[140px] shrink-0">
                    {field.label}
                  </span>
                  <span className="text-sm break-all">
                    {renderValue(field)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
