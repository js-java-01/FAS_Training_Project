import { useMemo } from "react"
import type { SortingState } from "@tanstack/react-table"

export function useSortParam(
  sorting: SortingState,
  defaultSort = "displayOrder,asc"
) {
  return useMemo(() => {
    if (!sorting.length) return defaultSort

    const { id, desc } = sorting[0]
    return `${id},${desc ? "desc" : "asc"}`
  }, [sorting, defaultSort])
}
