import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  saving?: boolean;
  onSave: () => void;
  onCancel?: () => void;
  saveText?: string;
  children: ReactNode;
};

export function SideFormPanel({
  open,
  onOpenChange,
  title,
  saving = false,
  onSave,
  onCancel,
  saveText = "Save",
  children,
}: Props) {
  const handleCancel = onCancel ?? (() => onOpenChange(false));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="p-0 sm:max-w-md" side="right">
        {/* Header: title left, Cancel + Save right (like Ant Design Drawer) */}
        <SheetHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
          <SheetTitle className="text-base font-semibold">{title}</SheetTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                saveText
              )}
            </Button>
          </div>
        </SheetHeader>

        {/* Form body */}
        <div className="p-4 grid gap-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
