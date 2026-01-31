import { MainLayout } from "@/components/layout/MainLayout"
import DynamicBreadcrumbs from "@/components/layout/DynamicBreadcrumbs"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { b64DecodeUnicode } from "@/utils/base64.utils"
import type { ModuleGroup } from "@/types/module"
import { FolderOpen } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

import { moduleGroupApi } from "@/api/moduleApi"

/* ------------------------------------------ */

export default function ModuleGroupDetail() {
    const { id } = useParams<{ id: string }>()
    const [moduleGroup, setModuleGroup] =
        useState<ModuleGroup | null>(null)
    const [loading, setLoading] = useState(false)

    const moduleGroupId = id
        ? b64DecodeUnicode(id)
        : null

    /* -------- LOAD MODULE GROUP -------------- */
    useEffect(() => {
        if (!moduleGroupId) return

        let mounted = true

        const fetchDetail = async () => {
            setLoading(true)
            try {
                const res =
                    await moduleGroupApi.getModuleGroupById(
                        moduleGroupId
                    )
                if (mounted) {
                    setModuleGroup(res)
                }
            } catch (err) {
                console.error(
                    "Failed to load module group",
                    err
                )
                if (mounted) {
                    setModuleGroup(null)
                }
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        fetchDetail()

        return () => {
            mounted = false
        }
    }, [moduleGroupId])
    /* ---------------------------------------- */

    return (
        <MainLayout
            breadcrumb={
                <DynamicBreadcrumbs
                    pathTitles={{
                        moduleGroups: "Module Groups",
                        ...(moduleGroup && id
                            ? { [id]: moduleGroup.name }
                            : {}),
                    }}
                />
            }
        >
            <div className={"grid grid-cols-1 gap-4"}>
                <div>
                    <div className={"flex flex-row gap-2"}>
                        <FolderOpen />
                        <h1 className={"font-semibold"}>
                            Module Group Details
                        </h1>
                    </div>
                    <p className={"text-gray-500 text-[15px]"}>
                        Overview and update history for this
                        module group
                    </p>
                </div>

                <div className={"grid grid-cols-[auto_1fr] gap-4"}>
                    <Card
                        className={
                            "grid bg-muted min-w-[500px]"
                        }
                    >
                        <CardHeader
                            className={"flex flex-row gap-4"}
                        >
                            <div
                                className={
                                    "bg-gray-200 rounded-4xl p-4 w-fit border border-gray-300 text-gray-500"
                                }
                            >
                                <FolderOpen />
                            </div>

                            <div>
                                <h1
                                    className={
                                        "font-semibold text-lg"
                                    }
                                >
                                    {loading
                                        ? "Loading..."
                                        : moduleGroup?.name}
                                </h1>
                                <p className={"text-gray-500"}>
                                    ID: {moduleGroup?.id}
                                </p>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {/* future: description, status, audit info */}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    )
}
