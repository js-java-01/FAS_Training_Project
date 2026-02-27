import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, Layers, Clock } from "lucide-react";
import type { Role } from "@/types/role";
import dayjs from "dayjs";

interface RoleDetailDialogProps {
  open: boolean;
  role: Role | null;
  onClose: () => void;
}

const DetailRow = ({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
      <Icon className="w-4 h-4" /> {label}
    </label>
    <div className="px-4 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground min-h-[42px] flex items-center">
      {children}
    </div>
  </div>
);

export function RoleDetailDialog({
  open,
  role,
  onClose,
}: RoleDetailDialogProps) {
  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" /> Role Details
          </DialogTitle>
          <DialogDescription>
            Overview and details for this role.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <DetailRow icon={Shield} label="Name">
            <span className="font-medium">{role.name}</span>
          </DetailRow>

          <DetailRow icon={FileText} label="Description">
            {role.description || (
              <span className="text-muted-foreground italic">
                No description
              </span>
            )}
          </DetailRow>

          <DetailRow icon={Layers} label="Hierarchy Level">
            {role.hierarchyLevel}
          </DetailRow>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
              <Shield className="w-4 h-4" /> Status
            </label>
            <div className="px-4 py-2.5 bg-muted border border-border rounded-lg text-sm min-h-[42px] flex items-center">
              {role.isActive ? (
                <Badge className="bg-green-100 text-green-700 border-green-200 shadow-none hover:bg-green-200">
                  Active
                </Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
              <Shield className="w-4 h-4" /> Permissions (
              {role.permissionNames?.length ?? 0})
            </label>
            <div className="px-4 py-2.5 bg-muted border border-border rounded-lg text-sm min-h-[42px]">
              {role.permissionNames?.length ? (
                <div className="flex flex-wrap gap-2">
                  {role.permissionNames.map((p) => (
                    <Badge key={p} variant="secondary" className="text-xs">
                      {p}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground italic">
                  No permissions
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DetailRow icon={Clock} label="Created At">
              {role.createdAt
                ? dayjs(role.createdAt).format("YYYY-MM-DD HH:mm")
                : "Unknown"}
            </DetailRow>
            <DetailRow icon={Clock} label="Updated At">
              {role.updatedAt
                ? dayjs(role.updatedAt).format("YYYY-MM-DD HH:mm")
                : "Unknown"}
            </DetailRow>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
