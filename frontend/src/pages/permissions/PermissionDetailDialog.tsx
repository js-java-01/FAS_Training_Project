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
import { KeyRound, FileText, Hash, Layers, Zap, Calendar } from "lucide-react";
import type { Permission } from "@/types/permission";
import dayjs from "dayjs";

const DetailRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value?: ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
      <Icon className="w-4 h-4 text-muted-foreground" /> {label}
    </label>
    <div className="px-4 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground min-h-10.5 flex items-center font-mono">
      {value || (
        <span className="text-muted-foreground italic font-sans">No data</span>
      )}
    </div>
  </div>
);

interface PermissionDetailDialogProps {
  open: boolean;
  onClose: () => void;
  permission: Permission | null;
}

export const PermissionDetailDialog = ({
  open,
  onClose,
  permission,
}: PermissionDetailDialogProps) => {
  if (!permission) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-140 p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-4 border-b bg-muted/70">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-600" />
            Permission Details
          </DialogTitle>
          <DialogDescription>
            Information about{" "}
            <strong className="font-mono">{permission.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <DetailRow icon={Hash} label="ID" value={permission.id} />
            <DetailRow icon={KeyRound} label="Name" value={permission.name} />
            <DetailRow
              icon={Layers}
              label="Resource"
              value={permission.resource}
            />
            <DetailRow icon={Zap} label="Action" value={permission.action} />
          </div>

          <DetailRow
            icon={FileText}
            label="Description"
            value={permission.description}
          />

          {permission.createdAt && (
            <DetailRow
              icon={Calendar}
              label="Created At"
              value={dayjs(permission.createdAt).format("YYYY-MM-DD HH:mm")}
            />
          )}
        </div>

        <DialogFooter className="p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
