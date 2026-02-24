import type { ComponentType, SVGProps, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileCode,
  FileText,
  Layers,
  ToggleLeft,
  Hash,
  Link as LinkIcon,
  Fingerprint,
} from "lucide-react";
import { iconMap } from "@/constants/iconMap";
import type { Module } from "@/types/module";

// --- Component DetailRow ---
const DetailRow = ({
  icon: Icon,
  label,
  value,
  isBadge = false,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value?: ReactNode;
  isBadge?: boolean;
}) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
      <Icon className="w-4 h-4 text-muted-foreground" /> {label}
    </label>
    <div className="px-4 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground min-h-[42px] flex items-center">
      {isBadge ? (
        value ? (
          <Badge className="bg-green-100 text-green-700 border-green-200 shadow-none hover:bg-green-200">
            Active
          </Badge>
        ) : (
          <Badge variant="destructive">Inactive</Badge>
        )
      ) : (
        value || <span className="text-muted-foreground italic">No data</span>
      )}
    </div>
  </div>
);

interface ModuleDetailDialogProps {
  open: boolean;
  onClose: () => void;
  module: Module | null;
}

export const ModuleDetailDialog = ({
  open,
  onClose,
  module,
}: ModuleDetailDialogProps) => {
  if (!module) return null;

  const IconComponent =
    module.icon && module.icon in iconMap
      ? iconMap[module.icon as keyof typeof iconMap]
      : FileCode;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-4 border-b bg-muted/70">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <IconComponent className="w-5 h-5 text-blue-600" />
            Module Details
          </DialogTitle>
          <DialogDescription>
            Information about <strong>{module.title}</strong> module.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <DetailRow icon={Hash} label="ID" value={module.id} />
             <DetailRow icon={FileCode} label="Title" value={module.title} />
             <DetailRow icon={LinkIcon} label="URL" value={module.url} />
             <DetailRow icon={Fingerprint} label="Permission" value={module.requiredPermission} />
          </div>

          <DetailRow icon={FileText} label="Description" value={module.description} />

          <div className="grid grid-cols-2 gap-5">
              <DetailRow
                  icon={Layers}
                  label="Display Order"
                  value={module.displayOrder}
              />
              <DetailRow
                  icon={ToggleLeft}
                  label="Status"
                  value={module.isActive}
                  isBadge
              />
          </div>
        </div>

        <DialogFooter className="p-6 border-t bg-muted/70">
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
