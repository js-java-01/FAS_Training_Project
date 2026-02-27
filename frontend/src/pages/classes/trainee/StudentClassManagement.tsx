import { MainLayout } from "@/components/layout/MainLayout"
import { Input } from "@/components/ui/input"

import { Separator } from "@/components/ui/separator"
import { Loader2, Search } from "lucide-react"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { ClassCard } from "../component/ClassCard"
import { useDebounce } from "@/hooks/useDebounce"
import { useMemo, useState } from "react"
import { useGetAllTrainingClasses } from "../service/queries"
import { EnrollModal } from "../component/EnrollModal"

export const StudentClassManagement = () => {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(6);
    const [searchValue, setSearchValue] = useState("");
    const [isOpenEnrollModal, setIsOpenEnrollModal] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const debouncedSearch = useDebounce(searchValue, 300);


    const { data: apiResponse, isLoading } = useGetAllTrainingClasses({
        page: pageIndex,
        size: pageSize,
        keyword: debouncedSearch,
    });
    const safeData = useMemo(() => ({
        items: apiResponse?.items ?? [],
        page: apiResponse?.pagination?.page ?? 0,
        totalElements: apiResponse?.pagination?.totalElements ?? 0,
        totalPages: apiResponse?.pagination?.totalPages ?? 0,
    }), [apiResponse]);

    const handleSearchValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
        setPageIndex(0);
    }

    const handleEnrollForm = (classId: string) => {
        setIsOpenEnrollModal(true);
        setSelectedClassId(classId);

    }

    return (
        <MainLayout pathName={{ studentClasses: "Student Classes" }}>
            <div className="container mx-auto py-6 space-y-8">

                <div className="flex flex-col gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tìm kiếm lớp học</h1>
                        <p className="text-muted-foreground">Khám phá và đăng ký các lớp học phù hợp với lộ trình của bạn.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Tên môn học, mã lớp hoặc giảng viên..." className="pl-9" value={searchValue} onChange={(e) => handleSearchValue(e)} />
                        </div>
                    </div>
                </div>

                <Separator />
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-64 w-full gap-2">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                        <p className="text-sm font-medium text-muted-foreground">Đang tải danh sách lớp học...</p>
                    </div>
                )}
                {/* Results Grid */}
                {safeData.items.length === 0 && !isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 w-full gap-2">
                        <p className="text-sm font-medium text-muted-foreground">Không tìm thấy lớp học nào.</p>
                    </div>
                ) : (<> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {safeData.items.map((item, i) => (
                        <ClassCard key={i}
                            data={item}
                            handleEnroll={handleEnrollForm}
                        />
                    ))}
                </div>
                    <EnrollModal
                        classId={selectedClassId ?? ""}
                        className={safeData.items.find(c => c.id === selectedClassId)?.className ?? ""}
                        isOpen={isOpenEnrollModal}
                        onClose={() => setIsOpenEnrollModal(false)}
                        onConfirm={async (enrollKey) => {
                            console.log("Enroll key:", enrollKey, "for class ID:", selectedClassId);
                        }}
                    />
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
                        <p className="text-sm text-muted-foreground whitespace-nowrap">
                            Hiển thị <b>{pageIndex * pageSize + 1}-{Math.min((pageIndex + 1) * pageSize, safeData.totalElements)}</b> trong tổng số <b>{safeData.totalElements}</b> lớp học
                        </p>
                        <Pagination className="justify-end">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setPageIndex(prev => Math.max(0, prev - 1));
                                        }}
                                        className={pageIndex === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>

                                {Array.from({ length: safeData.totalPages }).map((_, i) => {

                                    return (
                                        <PaginationItem key={i} className="hidden md:inline-block">
                                            <PaginationLink
                                                href="#"
                                                isActive={pageIndex === i}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setPageIndex(i);
                                                }}
                                            >
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                })}

                                {safeData.totalPages > 5 && <PaginationEllipsis />}

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setPageIndex(prev => Math.min(safeData.totalPages - 1, prev + 1));
                                        }}
                                        className={pageIndex >= safeData.totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div></>)}

            </div>
        </MainLayout>
    )
}