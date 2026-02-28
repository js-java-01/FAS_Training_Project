import { Eye, Pen, Trash2 } from "lucide-react";
import ActionButton from "./ActionButton";

interface RowActionsProps {
  row: any;
  onView: (row: any) => void;
  onEdit: (row: any) => void;
  onDelete: (row: any) => void;
}

export function RowActions({ row, onView, onEdit, onDelete }: RowActionsProps) {
  return (
    <>
      <ActionButton
        onClick={() => onView(row)}
        tooltip="View detail"
        icon={<Eye size={10} className="text-blue-500" />}
      />
      <ActionButton
        onClick={() => onEdit(row)}
        tooltip="Edit"
        icon={<Pen size={10} className="text-gray-500" />}
      />
      <ActionButton
        onClick={() => onDelete(row)}
        tooltip="Delete"
        icon={<Trash2 size={10} className="text-red-500" />}
      />
    </>
  );
}
