import { useMemo } from "react"
import { MainLayout } from "@/components/layout/MainLayout"


import { Separator } from "@/components/ui/separator"
import { BookOpen, GraduationCap } from "lucide-react"
import { ClassCard } from "../component/ClassCard"
import { MOCK } from "./MockData"

export const OwnClassPage = () => {
    // Tạm thời comment API lại, dùng data fake
    const isLoading = false;
    const data = MOCK

    const groupedClasses = useMemo(() => {
        return data.reduce((acc, curr) => {
            const semester = curr.semesterName || "Other";
            if (!acc[semester]) acc[semester] = [];
            acc[semester].push(curr);
            return acc;
        }, {} as Record<string, typeof MOCK>);
    }, [data]);

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

                {Object.entries(groupedClasses).map(([semester, classes]) => (
                    <section key={semester} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-slate-700 min-w-max">
                                {semester}
                            </h2>
                            <div className="h-[2px] w-full bg-gradient-to-r from-slate-200 to-transparent"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {classes.map((item) => (
                                <ClassCard key={item.id} data={item} isEnrolled={true} />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </MainLayout>
    )
}