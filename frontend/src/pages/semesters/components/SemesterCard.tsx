import { GenericDataCard, type DataItem } from "@/components/card/GenericDataCard";
import { CalendarDays, CalendarCheck, MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type SemesterResponse = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

interface SemesterCardProps {
  semester: SemesterResponse;
  onViewDetails?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSelect?: () => void;
}

export const SemesterCard = ({ semester, onViewDetails, onEdit, onDelete, onSelect }: SemesterCardProps) => {
  const items: DataItem[] = [
    {
      icon: CalendarDays,
      label: "Bắt đầu:",
      value: semester.startDate,
    },
    {
      icon: CalendarCheck,
      label: "Kết thúc:",
      value: semester.endDate,
    },
  ];

  return (
    <div className="relative group">
      <div className="absolute top-3 right-3 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-black/5">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {onViewDetails && (
              <DropdownMenuItem onClick={onViewDetails} className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4" />
                <span>Xem chi tiết</span>
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={onEdit} className="cursor-pointer text-blue-600">
                <Edit className="mr-2 h-4 w-4" />
                <span>Chỉnh sửa</span>
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={onDelete}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Xóa</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <GenericDataCard
        title={semester.name}
        items={items}
        action={{
          label: "Xem lớp học",
          className: "bg-blue-800 hover:bg-blue-900 text-white",
          onClick: () => {
            if (onSelect) onSelect();
          },
        }}
      />
    </div>
  );
};
