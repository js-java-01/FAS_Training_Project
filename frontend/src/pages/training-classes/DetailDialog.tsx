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
    GraduationCap,
    FileText,
    Calendar,
    User,
    ToggleLeft,
    Hash,
    BookOpen,
} from "lucide-react";
import type { TrainingClass } from "@/types/trainingClass";
import dayjs from "dayjs";

/* --- Detail Row --- */
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
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 shadow-none hover:bg-yellow-200">
                        Pending
                    </Badge>
                )
            ) : (
                value || <span className="text-muted-foreground italic">No data</span>
            )}
        </div>
    </div>
);

interface TrainingClassDetailDialogProps {
    open: boolean;
    onClose: () => void;
    trainingClass: TrainingClass | null;
}

export const TrainingClassDetailDialog = ({
    open,
    onClose,
    trainingClass,
}: TrainingClassDetailDialogProps) => {
    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) onClose();
    };

    if (!trainingClass) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 pb-4 border-b bg-muted/70">
                    <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                        Training Class Details
                    </DialogTitle>
                    <DialogDescription>
                        Information about <strong>{trainingClass.className}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
                    <DetailRow
                        icon={GraduationCap}
                        label="Class Name"
                        value={trainingClass.className}
                    />

                    <DetailRow
                        icon={Hash}
                        label="Class Code"
                        value={trainingClass.classCode}
                    />

                    <DetailRow
                        icon={BookOpen}
                        label="Semester"
                        value={trainingClass.semesterName}
                    />

                    <div className="grid grid-cols-2 gap-5">
                        <DetailRow
                            icon={User}
                            label="Creator"
                            value={trainingClass.creatorName}
                        />
                        <DetailRow
                            icon={User}
                            label="Approver"
                            value={trainingClass.approverName}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <DetailRow
                            icon={Calendar}
                            label="Start Date"
                            value={
                                trainingClass.startDate
                                    ? dayjs(trainingClass.startDate).format("DD-MM-YYYY")
                                    : undefined
                            }
                        />
                        <DetailRow
                            icon={Calendar}
                            label="End Date"
                            value={
                                trainingClass.endDate
                                    ? dayjs(trainingClass.endDate).format("DD-MM-YYYY")
                                    : undefined
                            }
                        />
                    </div>

                    {trainingClass.description && (
                        <DetailRow
                            icon={FileText}
                            label="Description"
                            value={trainingClass.description}
                        />
                    )}

                    <DetailRow
                        icon={ToggleLeft}
                        label="Status"
                        value={trainingClass.isActive}
                        isBadge
                    />
                </div>

                <DialogFooter className="p-6 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
