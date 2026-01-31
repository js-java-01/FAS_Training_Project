import { DataTable } from "@/components/data_table/DataTable"
import { getColumns } from "@/pages/modules/module/column"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import type { Module } from "@/types/module"
import { encodeBase64 } from "@/utils/base64.utils"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

import { moduleApi } from "@/api/moduleApi"

/* ------------------------------------------ */

export default function ModulesTable() {
    const navigate = useNavigate()
    const [data, setData] = useState<Module[]>([])
    const [loading, setLoading] = useState(false)

    /* -------- COLUMNS ------------------------ */
    const columns = useMemo(
        () =>
            getColumns({
                onView: (module) => {
                    navigate(`/modules/${encodeBase64(module.id)}`)
                },
                onEdit: (module) =>
                    console.log("Edit", module.id),
                onDelete: (module) =>
                    console.log("Delete", module.id),
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
                const res = await moduleApi.getAllModules()
                if (mounted) {
                    setData(res.content ?? res)
                }
            } catch (err) {
                console.error("Failed to load modules", err)
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
        <DataTable<Module, unknown>
            columns={columns as ColumnDef<Module, unknown>[]}
            data={data}
            isSearch={true}
            isLoading={loading}
            searchPlaceholder={"module name or description"}
            headerActions={
                <Button
                    onClick={() =>
                        navigate("/modules/create")
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
