import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Shield, Clock } from "lucide-react";
import type { User as UserType } from "@/types/auth";
import dayjs from "dayjs";

interface UserDetailDialogProps {
  open: boolean;
  user: UserType | null;
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
    <div className="px-4 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground min-h-10.5 flex items-center">
      {children}
    </div>
  </div>
);

export function UserDetailDialog({
  open,
  user,
  onClose,
}: UserDetailDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" /> User Details
          </DialogTitle>
          <DialogDescription>
            Overview and details for this user account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <DetailRow icon={User} label="First Name">
              {user.firstName}
            </DetailRow>
            <DetailRow icon={User} label="Last Name">
              {user.lastName}
            </DetailRow>
          </div>

          <DetailRow icon={Mail} label="Email">
            {user.email}
          </DetailRow>

          <DetailRow icon={Shield} label="Role">
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              {user.roleName || "-"}
            </span>
          </DetailRow>

          <DetailRow icon={Shield} label="Status">
            {user.isActive ? (
              <Badge className="bg-green-100 text-green-700 border-green-200 shadow-none hover:bg-green-200">
                Active
              </Badge>
            ) : (
              <Badge variant="destructive">Inactive</Badge>
            )}
          </DetailRow>

          <div className="grid grid-cols-2 gap-4">
            <DetailRow icon={Clock} label="Created At">
              {user.createdAt
                ? dayjs(user.createdAt).format("YYYY-MM-DD HH:mm")
                : "Unknown"}
            </DetailRow>
            <DetailRow icon={Clock} label="Updated At">
              {user.updatedAt
                ? dayjs(user.updatedAt).format("YYYY-MM-DD HH:mm")
                : "Unknown"}
            </DetailRow>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
