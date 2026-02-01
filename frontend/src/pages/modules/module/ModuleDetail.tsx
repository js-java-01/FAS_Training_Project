import { MainLayout } from "@/components/layout/MainLayout.tsx";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { b64DecodeUnicode } from "@/utils/base64.utils.ts"; // Ensure this path is correct based on your workspace
import type { Module } from "@/types/module";
import { FileCode, Activity, Link as LinkIcon, Trash, Edit, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { iconMap } from "@/constants/iconMap";
import { moduleApi } from "@/api/moduleApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ModuleForm } from "./ModuleForm";

export default function ModuleDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [moduleData, setModuleData] = useState<Module | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const moduleId = id ? b64DecodeUnicode(id) : null;

    useEffect(() => {
        const fetchModule = async () => {
            if (!moduleId) return;
            try {
                setLoading(true);
                const data = await moduleApi.getModuleById(moduleId);
                setModuleData(data);
            } catch (error) {
                console.error("Failed to fetch module details", error);
                toast.error("Failed to load module details");
            } finally {
                setLoading(false);
            }
        };

        fetchModule();
    }, [moduleId]);

    const handleDelete = async () => {
        if (!moduleData || !confirm("Are you sure you want to delete this module?")) return;
        try {
            await moduleApi.deleteModule(moduleData.id);
            toast.success("Module deleted successfully");
            navigate("/modules");
        } catch (error) {
            console.error("Failed to delete module", error);
            toast.error("Failed to delete module");
        }
    };

    const handleUpdate = async (formData: Partial<Module>) => {
        if (!moduleData?.id) return;
        try {
            // formData will come from ModuleForm onSubmit
            const updated = await moduleApi.updateModule(moduleData.id, formData);
            setModuleData(updated);
            setIsEditOpen(false);
            toast.success("Module updated successfully");
        } catch (error) {
            console.error("Update failed", error);
            toast.error("Failed to update module");
        }
    };


    if (loading) {
        return (
             <MainLayout pathName={{ modules: "Module Management", details: "Loading..." }}>
                <div className="flex justify-center items-center h-[50vh]">Loading...</div>
             </MainLayout>
        )
    }

    if (!moduleData) {
        return (
            <MainLayout pathName={{ modules: "Module Management" }}>
                <div className="p-4">
                    <p>Module not found.</p>
                    <Button onClick={() => navigate("/modules")} variant="outline" className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                    </Button>
                </div>
            </MainLayout>
        );
    }

    const IconComponent = (moduleData.icon && iconMap[moduleData.icon]) ? iconMap[moduleData.icon] : FileCode;

    return (
        <MainLayout
            pathName={{
                modules: "Module Management",
                ...(moduleData && id ? { [id]: moduleData.title } : {}),
            }}
        >
            <div className={"grid grid-cols-1 gap-4"}>
                <div className="flex justify-between items-start">
                    <div>
                        <div className={"flex flex-row gap-2 items-center"}>
                            <Button variant="ghost" size="icon" onClick={() => navigate("/modules")}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <IconComponent className="h-6 w-6" />
                            <h1 className={"font-semibold text-xl"}>Module Details</h1>
                        </div>
                        <p className={"text-gray-500 text-[15px] ml-11"}>
                            Overview for {moduleData.title}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsEditOpen(true)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash className="h-4 w-4 mr-2" /> Delete
                        </Button>
                    </div>
                </div>

                <div className={"grid grid-cols-[auto_1fr] gap-4"}>
                    <Card className={"grid bg-muted min-w-[500px] w-full"}>
                        <CardHeader className={"flex flex-row gap-4"}>
                            <div className={"bg-gray-200 rounded-4xl p-4 w-fit border border-gray-300 text-gray-500 h-fit"}>
                                <IconComponent className="w-8 h-8"/>
                            </div>
                            <div>
                                <h1 className={"font-semibold text-lg"}>{moduleData.title}</h1>
                                <p className={" text-gray-500"}>ID: {moduleData.id}</p>
                            </div>
                        </CardHeader>
                        <CardContent className={"grid grid-cols-2 gap-x-8 gap-y-6"}>
                            <div className="col-span-2">
                                <label className="text-sm font-medium text-gray-500 block mb-1">Description</label>
                                <p className="text-gray-900">{moduleData.description || "No description provided"}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">URL / Component Path</label>
                                <div className="flex items-center gap-2 text-gray-900">
                                    <LinkIcon className="h-4 w-4 text-gray-400" />
                                    <span>{moduleData.url || "N/A"}</span>
                                </div>
                            </div>

                             <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">Required Permission</label>
                                <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded w-fit">{moduleData.requiredPermission || "None"}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">Status</label>
                                <div className="flex items-center gap-2">
                                     <Activity className={`h-4 w-4 ${moduleData.isActive ? "text-green-500" : "text-gray-400"}`} />
                                    <span className={moduleData.isActive ? "text-green-700 font-medium" : "text-gray-500"}>
                                        {moduleData.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>

                             <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">Display Order</label>
                                <p>{moduleData.displayOrder}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">Module Group</label>
                                <p>{moduleData.moduleGroupId}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ModuleForm
                open={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSubmit={handleUpdate}
                initialData={moduleData}
            />
        </MainLayout>
    );
}
