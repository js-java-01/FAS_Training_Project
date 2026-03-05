
import { MainLayout } from "@/components/layout/MainLayout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, BookOpen } from "lucide-react"

import { OwnClassPage } from "./OwnClassPage"
import { useState } from "react"

export default function StudentClassManagement() {
    const [activeTab, setActiveTab] = useState("my-classes");
    return (
        <MainLayout pathName={{ studentClasses: "Classes" }}>
            <div className="container mx-auto py-2 px-4 max-w-7xl h-screen flex flex-col overflow-hidden">
                <div className="mb-6 space-y-2 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Class Management
                        </h1>
                    </div>
                    <p className="text-slate-500 max-w-2xl">
                        Manage your training classes, view class details, and track your progress in each class.
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
                    <div className="border-b border-slate-200 shrink-0">
                        <TabsList className="bg-transparent h-12 p-0 gap-8">
                            <TabsTrigger value="my-classes" className="...">
                                <GraduationCap className="mr-2 h-4 w-4" />
                                My Classes
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent
                        value="my-classes"
                        className="m-0 focus-visible:outline-none flex-1 min-h-0 mt-4"
                    >
                        <div className="h-full rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
                            <div className="flex-1 overflow-y-auto p-6">
                                <OwnClassPage />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    )
}