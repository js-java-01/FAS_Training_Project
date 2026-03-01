import { MainLayout } from "@/components/layout/MainLayout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Search, Users, CalendarDays, Clock, BookOpen } from "lucide-react"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { ClassCard } from "./component/ClassCard"

const StudentClassManagement = () => {
    return (
        <MainLayout pathName={{ studentClasses: "Student Classes" }}>
            <div className="container mx-auto py-6 space-y-8">

                {/* Header & Search Section */}
                <div className="flex flex-col gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tìm kiếm lớp học</h1>
                        <p className="text-muted-foreground">Khám phá và đăng ký các lớp học phù hợp với lộ trình của bạn.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Tên môn học, mã lớp hoặc giảng viên..." className="pl-9" />
                        </div>
                        <Select>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Chọn học kỳ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2025.1">Học kỳ 1 - 2025</SelectItem>
                                <SelectItem value="2025.2">Học kỳ 2 - 2025</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="default">Tìm kiếm</Button>
                    </div>
                </div>

                <Separator />

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <ClassCard key={i}
                            code={`CS${100 + i}`}
                            name={`Lập trình nâng cao ${i}`}
                            instructor={`Giảng viên ${i}`}
                            schedule={`Thứ ${i} 8:00 - 10:00`}
                            capacity={`${20 + i}/30`}
                            status={i % 2 === 0 ? "open" : "closed"}
                        />
                    ))}
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
                    <p className="text-sm text-muted-foreground whitespace-nowrap">
                        Hiển thị <b>1-6</b> trong tổng số <b>24</b> lớp học
                    </p>
                    <Pagination className="justify-end">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href="#" />
                            </PaginationItem>

                            <PaginationItem className="hidden md:inline-block">
                                <PaginationLink href="#" isActive>1</PaginationLink>
                            </PaginationItem>

                            <PaginationItem className="hidden md:inline-block">
                                <PaginationLink href="#">2</PaginationLink>
                            </PaginationItem>

                            <PaginationItem className="hidden md:inline-block">
                                <PaginationLink href="#">3</PaginationLink>
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationNext href="#" />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </MainLayout>
    )
}

export default StudentClassManagement;
