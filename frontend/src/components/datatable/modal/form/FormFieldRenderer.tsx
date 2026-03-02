import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FieldSchema } from "@/types/common/datatable";
import { FieldError } from "./FieldError";
import { MultiRelationSelect } from "./MultiRelationSelect";

interface FormFieldRendererProps {
  field: FieldSchema;
  value: any;
  errorClass: string;
  fieldErrors?: string[];
  relationOptions?: Record<string, any[]>;
  onChange: (name: string, value: any) => void;
}

/**
 * Render input phù hợp cho từng loại field trong form.
 */
export function FormFieldRenderer({
  field,
  value,
  errorClass,
  fieldErrors,
  relationOptions = {},
  onChange,
}: FormFieldRendererProps) {
  switch (field.type) {
    case "boolean":
      return (
        <div className="flex items-center justify-between gap-4 py-1">
          <Label htmlFor={field.name} className="flex-1">
            {field.label}
          </Label>
          <Switch
            id={field.name}
            checked={!!value}
            onCheckedChange={(checked) => onChange(field.name, checked)}
          />
        </div>
      );

    case "select":
      return (
        <div className="grid gap-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Select
            value={value?.toString() || ""}
            onValueChange={(val) => onChange(field.name, val)}
          >
            <SelectTrigger className={errorClass}>
              <SelectValue
                placeholder={`Select ${field.label.toLowerCase()}...`}
              />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).map((opt) => (
                <SelectItem key={opt.value} value={opt.value?.toString()}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={fieldErrors} />
        </div>
      );

    case "relation": {
      const rel = field.relation;
      if (!rel) return null;
      const items: any[] = relationOptions[field.name] ?? [];

      // Multiple select with checkboxes
      if (rel.multiple) {
        return (
          <MultiRelationSelect
            field={field}
            rel={rel}
            items={items}
            value={value}
            errorClass={errorClass}
            onChange={(val) => onChange(field.name, val)}
            fieldErrors={fieldErrors}
          />
        );
      }

      // Single select
      return (
        <div className="grid gap-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Select
            value={value?.toString() || ""}
            onValueChange={(val) => onChange(field.name, val)}
          >
            <SelectTrigger className={errorClass}>
              <SelectValue
                placeholder={`Select ${field.label.toLowerCase()}...`}
              />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem
                  key={item[rel.valueField]}
                  value={item[rel.valueField]?.toString()}
                >
                  {item[rel.labelField]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={fieldErrors} />
        </div>
      );
    }

    case "number":
      return (
        <div className="grid gap-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Input
            id={field.name}
            type="number"
            className={errorClass}
            value={value ?? ""}
            onChange={(e) =>
              onChange(
                field.name,
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
          <FieldError errors={fieldErrors} />
        </div>
      );

    case "date":
      return (
        <div className="grid gap-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Input
            id={field.name}
            type="date"
            className={errorClass}
            value={value || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
          />
          <FieldError errors={fieldErrors} />
        </div>
      );

    case "password":
      return (
        <div className="grid gap-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Input
            id={field.name}
            type="password"
            className={errorClass}
            value={value || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            autoComplete="new-password"
          />
          <FieldError errors={fieldErrors} />
        </div>
      );

    case "text":
    default:
      return (
        <div className="grid gap-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Input
            id={field.name}
            className={errorClass}
            value={value || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
          <FieldError errors={fieldErrors} />
        </div>
      );
  }
}
