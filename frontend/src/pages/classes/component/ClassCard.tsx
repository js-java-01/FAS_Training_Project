import { BookOpen, CalendarDays, Clock, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

interface ClassProps {
    code: string
    name: string
    instructor: string
    schedule: string
    capacity: string
    status: "open" | "closed"
}

export const ClassCard = ({
    code,
    name,
    instructor,
    schedule,
    capacity,
    status
}: ClassProps) => {
    return (
        <Card className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer flex flex-col h-full">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="font-mono">{code}</Badge>
                    <Badge
                        variant="outline"
                        className={status === "open"
                            ? "text-green-600 bg-green-50 border-green-200"
                            : "text-red-600 bg-red-50 border-red-200"}
                    >
                        {status === "open" ? "Mở đăng ký" : "Đã đóng"}
                    </Badge>
                </div>
                <CardTitle className="text-xl line-clamp-1">{name}</CardTitle>

            </CardHeader>

            <CardContent className="grid gap-4 text-sm text-muted-foreground flex-1">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="line-clamp-1">GV. {instructor}</span>
                </div>
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>{schedule}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Sĩ số: {capacity}</span>
                </div>
            </CardContent>

            <CardFooter className="bg-slate-50/50 border-t p-4">
                <Button
                    className="w-full bg-blue-800 hover:bg-blue-900 text-white"
                    disabled={status === "closed"}
                >
                    {status === "open" ? "Enroll Now" : "Full Slot"}
                </Button>
            </CardFooter>
        </Card>
    )
}