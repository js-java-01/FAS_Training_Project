
import { MainLayout } from "@/components/layout/MainLayout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, GraduationCap, BookOpen } from "lucide-react"

import { OwnClassPage } from "./OwnClassPage"
import { useState } from "react"
import SearchClass from "./SearchClass"

export default function StudentClassManagement() {
    const [activeTab, setActiveTab] = useState("my-classes");
    return (
        <MainLayout pathName={{ studentClasses: "Classes" }}>
            <div className="container mx-auto py-8 px-4 max-w-7xl animate-in fade-in duration-500">

                <div className="mb-10 space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Hệ thống lớp học
                        </h1>
                    </div>
                    <p className="text-slate-500 max-w-2xl">
                        Khám phá các khóa học mới hoặc quản lý tiến độ học tập cá nhân của bạn trong từng học kỳ.
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <div className="border-b border-slate-200">
                        <TabsList className="bg-transparent h-12 p-0 gap-8">

                            <TabsTrigger
                                value="my-classes"
                                className="relative h-12 text-md rounded-none border-b-2 border-transparent bg-transparent px-3 pb-3 pt-3 font-semibold text-slate-500 transition-none data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
                            >
                                <GraduationCap className="mr-2 h-4 w-4" />
                                Lớp của tôi
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="min-h-[600px]">


                        <TabsContent value="my-classes" className="m-0 focus-visible:outline-none">
                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <OwnClassPage />
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </MainLayout>
    )
}