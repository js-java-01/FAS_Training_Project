import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import type { FieldSchema } from "@/types/common/datatable";
import { FormFieldRenderer } from "./FormFieldRenderer";

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
      const defaults: Record<string, any> = {};
      editableFields.forEach((f) => {
        if (f.type === "boolean") defaults[f.name] = false;
        else if (f.type === "relation" && f.relation?.multiple)
          defaults[f.name] = [];
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

  const hasError = (fieldName: string) =>
    fieldErrors[fieldName] && fieldErrors[fieldName].length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
          {editableFields.map((field) => (
            <FormFieldRenderer
              key={field.name}
              field={field}
              value={form[field.name]}
              errorClass={
                hasError(field.name)
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
              fieldErrors={fieldErrors[field.name]}
              relationOptions={relationOptions}
              onChange={updateField}
            />
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onClose(false)}
            disabled={isSubmitting}
          >
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