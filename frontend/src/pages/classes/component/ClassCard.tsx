import { CalendarDays, Clock, Users, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import type { TrainingClass } from "@/types/trainingClass"


interface ClassCardProps {
    data: TrainingClass,
    isEnrolled?: boolean;
}

export const ClassCard = ({ data, isEnrolled }: ClassCardProps) => {
    // Logic: Nếu chưa được duyệt (approverName là null) HOẶC lớp không active thì disable
    const isPending = data.approverName === null;
    const canEnroll = data.isActive && !isPending;
    const getButtonConfig = () => {
        if (isEnrolled) {
            return {
                text: "View Details",
                className: "bg-emerald-600 hover:bg-emerald-700 shadow-md",
                disabled: false,
                variant: "default" as const
            };
        }


        if (isPending) {
            return {
                text: "Pending Approval",
                className: "bg-slate-300 cursor-not-allowed",
                disabled: true,
                variant: "secondary" as const
            };
        }

        if (!data.isActive) {
            return {
                text: "Class Closed",
                className: "bg-slate-300 cursor-not-allowed",
                disabled: true,
                variant: "secondary" as const
            };
        }

        return {
            text: "Enroll Now",
            className: "bg-blue-800 hover:bg-blue-900 shadow-md",
            disabled: false,
            variant: "default" as const
        };
    };

    const config = getButtonConfig();

    return (
        <Card className="overflow-hidden hover:border-primary/50 transition-all cursor-pointer flex flex-col h-full shadow-sm hover:shadow-md">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="font-mono text-xs">
                        {data.classCode}
                    </Badge>
                    <Badge
                        variant="outline"
                        className={data.isActive
                            ? "text-green-600 bg-green-50 border-green-200"
                            : "text-red-600 bg-red-50 border-red-200"}
                    >
                        {data.isActive ? "Đang mở" : "Chưa mở đăng ký"}
                    </Badge>
                </div>
                <CardTitle className="text-xl line-clamp-2 min-h-[3.5rem] flex items-start gap-2">
                    <BookOpen className="h-5 w-5 mt-1 text-blue-600 shrink-0" />
                    {data.className}
                </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-3 text-sm text-muted-foreground flex-1">
                {/* Giảng viên / Người tạo */}
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span className="line-clamp-1">
                        GV: {data.trainerNames?.join(", ") ?? "Đang cập nhật"}
                    </span>
                </div>

                {/* Học kỳ */}
                <div className="flex items-center gap-2 font-medium text-slate-700">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{data.semesterName}</span>
                </div>

                {/* Thời gian */}
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    <span className="text-xs italic">
                        {data.startDate} → {data.endDate}
                    </span>
                </div>

                {/* Trạng thái duyệt (Nếu chưa duyệt thì hiện nhắc nhở) */}
                {isPending && (
                    <p className="text-[10px] text-amber-600 font-medium bg-amber-50 p-1 rounded border border-amber-100 mt-2">
                        * Lớp đang chờ phê duyệt để đăng ký
                    </p>
                )}
            </CardContent>

            <CardFooter className="bg-slate-50/50 border-t p-4 mt-auto">
                <Button
                    className={`w-full text-white transition-all ${config.className}`}
                    disabled={config.disabled}
                    variant={config.variant}
                >
                    {config.text}
                </Button>
            </CardFooter>
        </Card>
    )
}