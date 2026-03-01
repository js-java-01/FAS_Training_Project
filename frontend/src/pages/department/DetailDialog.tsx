import type { Department } from "@/types/department";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Hash, MapPin, FileText } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

interface DetailRowProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value?: string | null;
  isBadge?: boolean;
}

const DetailRow = ({ icon: Icon, label, value, isBadge = false }: DetailRowProps) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
      <Icon className="w-4 h-4 text-gray-500" /> {label}
    </label>
    <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 min-h-[42px] flex items-center">
      {isBadge ? (
        value ? (
          <Badge className="bg-green-100 text-green-700">Active</Badge>
        ) : (
          <Badge variant="destructive">Inactive</Badge>
        )
      ) : (
        value || <span className="text-gray-400 italic">No data</span>
      )}
    </div>
  </div>
);

interface DepartmentDetailDialogProps {
  open: boolean;
  department: Department | null;
  onClose: () => void;
}

export function DepartmentDetailDialog({
  open,
  department,
  onClose,
}: DepartmentDetailDialogProps) {
  if (!department) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle>{department.name}</DialogTitle>
              <p className="text-xs text-gray-500 mt-1">ID: {department.id}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-4 py-4">
          <DetailRow
            icon={Hash}
            label="Department Code"
            value={department.code}
          />
          <DetailRow
            icon={MapPin}
            label="Location"
            value={department.locationName || "N/A"}
          />
          <DetailRow
            icon={FileText}
            label="Description"
            value={department.description || "No description provided"}
          />
        </div>

        <DialogFooter>
          <Button type="button" onClick={onClose} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
