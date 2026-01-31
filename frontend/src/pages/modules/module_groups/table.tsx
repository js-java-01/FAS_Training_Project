import { DataTable } from "@/components/data_table/DataTable"
import { getColumns } from "@/pages/modules/module_groups/column"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { encodeBase64 } from "@/utils/base64.utils"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

import type { ModuleGroup } from "@/types/module"
import { moduleGroupApi } from "@/api/moduleApi"

/* ------------------------------------------ */

export default function ModuleGroupsTable() {
    const navigate = useNavigate()
    const [data, setData] = useState<ModuleGroup[]>([])
    const [loading, setLoading] = useState(false)

    /* -------- COLUMNS ------------------------ */
    const columns = useMemo(
        () =>
            getColumns({
                onView: (group) => {
                    navigate(`/moduleGroups/${encodeBase64(group.id)}`)
                },
                onEdit: (group) =>
                    console.log("Edit", group.id),
                onDelete: (group) =>
                    console.log("Delete", group.id),
            }),
        [navigate]
    )
    /* ---------------------------------------- */

    /* -------- LOAD DATA (API) ---------------- */
    useEffect(() => {
        let mounted = true

        const fetchData = async () => {
            setLoading(true)
            try {
                const res = await moduleGroupApi.getAllModuleGroupsList()
                if (mounted) {
                    setData(res)
                }
            } catch (err) {
                console.error("Failed to load module groups", err)
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        fetchData()

        return () => {
            mounted = false
        }
    }, [])

    /* ---------------------------------------- */

    return (
        <DataTable<ModuleGroup, unknown>
            columns={columns as ColumnDef<ModuleGroup, unknown>[]}
            data={data}
            isSearch={true}
            isLoading={loading}
            searchPlaceholder={"module group name or description"}
            headerActions={
                <Button
                    onClick={() =>
                        navigate("/moduleGroups/create")
                    }
                    className="justify-self-end w-full lg:w-30 bg-blue-600 text-white"
                    variant="outline"
                    autoFocus={false}
                >
                    Add New
                    <Plus className="h-4 w-4" />
                </Button>
            }
        />
    )
}
