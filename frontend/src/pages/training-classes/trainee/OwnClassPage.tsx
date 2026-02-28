import { useMemo } from "react"
import { MainLayout } from "@/components/layout/MainLayout"


import { Separator } from "@/components/ui/separator"
import { GraduationCap, Loader2 } from "lucide-react"
import { ClassCard } from "./component/ClassCard"
import { useGetMyClasses } from "./service/queries"



export const OwnClassPage = () => {

    const { data: apiResponse, isLoading } = useGetMyClasses();
    const semesters = useMemo(() => apiResponse?.data ?? [], [apiResponse]);
    if (isLoading) {
        return (
            <MainLayout pathName={{ ownClasses: "My Classes" }}>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-800" />
                </div>
            </MainLayout>
        );
    }
    const handleClickClassCard = (classId: string) => {
        alert(`Chuyển đến trang chi tiết lớp học với ID: ${classId}`);
    }

    return (
        <MainLayout pathName={{ ownClasses: "My Classes" }}>
            <div className="container mx-auto py-8 px-4 space-y-10">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <GraduationCap className="h-8 w-8 text-blue-800" />
                            Lớp học của tôi
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Quản lý tiến độ học tập qua các học kỳ.
                        </p>
                    </div>
                </div>

                <Separator className="bg-slate-200" />

                {!isLoading && semesters.length === 0 && (
                    <div className="text-center py-20 text-slate-500">
                        Bạn chưa tham gia lớp học nào.
                    </div>
                )}


                {semesters.map((semesterGroup) => (
                    <section key={semesterGroup.semesterId} className="space-y-6">

                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-slate-700 min-w-max">
                                {semesterGroup.semesterName}
                            </h2>
                            <div className="h-[2px] w-full bg-gradient-to-r from-slate-200 to-transparent"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {semesterGroup.classes.map((cls) => (
                                <ClassCard
                                    key={cls.id}
                                    data={cls}
                                    isEnrolled={true}
                                    handleEnroll={handleClickClassCard}
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </MainLayout>
    )
}