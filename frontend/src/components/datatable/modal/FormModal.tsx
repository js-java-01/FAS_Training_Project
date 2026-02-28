import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ChevronDown, X } from "lucide-react";
import { useState, useEffect } from "react";
import type { FieldSchema } from "@/types/common/datatable";

interface FormModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
  schema: any;
  onSubmit: (data: any) => void;
  initial?: any;
  title?: string;
  isSubmitting?: boolean;
  relationOptions?: Record<string, any[]>;
  fieldErrors?: Record<string, string[]>;
}

export function FormModal({
  open,
  onClose,
  schema,
  onSubmit,
  initial,
  title = "Form",
  isSubmitting = false,
  relationOptions = {},
  fieldErrors = {},
}: FormModalProps) {
  const [form, setForm] = useState<Record<string, any>>({});

  const editableFields: FieldSchema[] = schema.fields.filter(
    (f: FieldSchema) => f.editable !== false
  );

  useEffect(() => {
    if (initial) {
      setForm(initial);
    } else {
      // Initialize defaults for create mode
      const defaults: Record<string, any> = {};
      editableFields.forEach((f) => {
        if (f.type === "boolean") defaults[f.name] = false;
        else if (f.type === "relation" && f.relation?.multiple) defaults[f.name] = [];
        else if (f.type === "number") defaults[f.name] = "";
        else defaults[f.name] = "";
      });
      setForm(defaults);
    }
  }, [initial, open]);

  const updateField = (name: string, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(form);
  };

  const renderFieldError = (fieldName: string) => {
    const errors = fieldErrors[fieldName];
    if (!errors || errors.length === 0) return null;
    return (
      <div className="flex items-start gap-1.5 text-destructive">
        <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <div className="text-xs space-y-0.5">
          {errors.map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </div>
      </div>
    );
  };

  const hasError = (fieldName: string) =>
    fieldErrors[fieldName] && fieldErrors[fieldName].length > 0;

  const renderField = (field: FieldSchema) => {
    const value = form[field.name];
    const errorClass = hasError(field.name) ? "border-destructive focus-visible:ring-destructive" : "";

    switch (field.type) {
      case "boolean":
        return (
          <div key={field.name} className="flex items-center justify-between gap-4 py-1">
            <Label htmlFor={field.name} className="flex-1">
              {field.label}
            </Label>
            <Switch
              id={field.name}
              checked={!!value}
              onCheckedChange={(checked) => updateField(field.name, checked)}
            />
          </div>
        );

      case "select":
        return (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Select
              value={value?.toString() || ""}
              onValueChange={(val) => updateField(field.name, val)}
            >
              <SelectTrigger className={errorClass}>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
              </SelectTrigger>
              <SelectContent>
                {(field.options || []).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value?.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renderFieldError(field.name)}
          </div>
        );

      case "relation": {
        const rel = field.relation;
        if (!rel) return null;
        const items: any[] = relationOptions[field.name] ?? [];

        // Multiple select with checkboxes
        if (rel.multiple) {
          const selectedValues: any[] = Array.isArray(value) ? value : [];
          const selectedItems = items.filter((item) =>
            selectedValues.some(
              (v) => v?.toString() === item[rel.valueField]?.toString()
            )
          );

          const toggleItem = (itemValue: any) => {
            const strVal = itemValue?.toString();
            const exists = selectedValues.some((v) => v?.toString() === strVal);
            if (exists) {
              updateField(
                field.name,
                selectedValues.filter((v) => v?.toString() !== strVal)
              );
            } else {
              updateField(field.name, [...selectedValues, itemValue]);
            }
          };

          return (
            <div key={field.name} className="grid gap-2">
              <Label>{field.label}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-between font-normal h-auto min-h-9 ${errorClass}`}
                  >
                    <div className="flex flex-wrap gap-1 flex-1">
                      {selectedItems.length > 0 ? (
                        selectedItems.map((item) => (
                          <Badge
                            key={item[rel.valueField]}
                            variant="secondary"
                            className="text-xs gap-1"
                          >
                            {item[rel.labelField]}
                            <X
                              size={12}
                              className="cursor-pointer hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleItem(item[rel.valueField]);
                              }}
                            />
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">
                          Select {field.label.toLowerCase()}...
                        </span>
                      )}
                    </div>
                    <ChevronDown size={14} className="shrink-0 ml-2 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <div className="max-h-[200px] overflow-y-auto p-1">
                    {items.map((item) => {
                      const itemVal = item[rel.valueField];
                      const checked = selectedValues.some(
                        (v) => v?.toString() === itemVal?.toString()
                      );
                      return (
                        <div
                          key={itemVal}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                          onClick={() => toggleItem(itemVal)}
                        >
                          <Checkbox checked={checked} />
                          <span className="text-sm">{item[rel.labelField]}</span>
                        </div>
                      );
                    })}
                    {items.length === 0 && (
                      <div className="px-2 py-4 text-sm text-center text-muted-foreground">
                        No options available
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              {renderFieldError(field.name)}
            </div>
          );
        }

        // Single select
        return (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Select
              value={value?.toString() || ""}
              onValueChange={(val) => updateField(field.name, val)}
            >
              <SelectTrigger className={errorClass}>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
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
            {renderFieldError(field.name)}
          </div>
        );
      }

      case "number":
        return (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              type="number"
              className={errorClass}
              value={value ?? ""}
              onChange={(e) =>
                updateField(field.name, e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder={`Enter ${field.label.toLowerCase()}...`}
            />
            {renderFieldError(field.name)}
          </div>
        );

      case "date":
        return (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              type="date"
              className={errorClass}
              value={value || ""}
              onChange={(e) => updateField(field.name, e.target.value)}
            />
            {renderFieldError(field.name)}
          </div>
        );

      case "password":
        return (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              type="password"
              className={errorClass}
              value={value || ""}
              onChange={(e) => updateField(field.name, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              autoComplete="new-password"
            />
            {renderFieldError(field.name)}
          </div>
        );

      case "text":
      default:
        return (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              className={errorClass}
              value={value || ""}
              onChange={(e) => updateField(field.name, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
            />
            {renderFieldError(field.name)}
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
          {editableFields.map(renderField)}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}