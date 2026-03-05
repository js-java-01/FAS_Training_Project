import { useMemo } from "react"
import { Loader2 } from "lucide-react"
import { ClassCard } from "./component/ClassCard"
import { useGetMyClasses } from "./service/queries"
import { encodeRouteId } from "@/utils/routeIdCodec";



export const OwnClassPage = () => {
    const navigate = useNavigate();

    const { data: apiResponse, isLoading } = useGetMyClasses();
    const semesters = useMemo(() => apiResponse?.data ?? [], [apiResponse]);
    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-800" />
            </div>
        );
    }
    const handleClickClassCard = (classId: string) => {
        navigate(`/classes/${encodeRouteId("classes", classId)}`);
    }

    return (

        <div className="container mx-auto py-8 px-4 space-y-10">
            {!isLoading && semesters.length === 0 && (
                <div className="text-center py-20 text-slate-500">
                    You are not enrolled in any classes yet. Explore available classes and start learning today!
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

    )
}