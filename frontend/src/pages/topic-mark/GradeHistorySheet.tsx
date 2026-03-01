import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import {
  CalendarIcon,
  ArrowUpDown,
  HistoryIcon,
  Search,
  RotateCcw,
  ArrowBigRight,
} from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import {
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react"
import { TooltipWrapper } from "@/components/TooltipWrapper"
import { useVirtualizer } from "@tanstack/react-virtual"
import type { GradeHistoryItem } from "@/types/topicMark"
import { useInfiniteGradeHistory } from "./services/queries"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseClassId: string
}

export default function GradeHistorySheet({
  open,
  onOpenChange,
  courseClassId,
}: Props) {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] =
    useState<"all" | "increase" | "decrease">("all")
  const [dateRange, setDateRange] =
    useState<DateRange | undefined>()
  const [sortOrder, setSortOrder] =
    useState<"desc" | "asc">("desc")

  // debounce
  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedSearch(search),
      300
    )
    return () => clearTimeout(t)
  }, [search])

  // reset filters when sheet closes
  useEffect(() => {
    if (!open) {
      setSearch("")
      setStatusFilter("all")
      setDateRange(undefined)
      setSortOrder("desc")
    }
  }, [open])

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteGradeHistory(courseClassId)

  // flatten pages
  const rawHistoryList: GradeHistoryItem[] =
    data?.pages.flatMap((p) => p.content) ?? []

  // filter client-side
  const filteredHistory = useMemo(() => {
    let result = rawHistoryList

    if (debouncedSearch) {
      const keyword = debouncedSearch.toLowerCase()
      result = result.filter((item) =>
        item.student.name
          .toLowerCase()
          .includes(keyword)
      )
    }

    if (statusFilter !== "all") {
      result = result.filter((item) => {
        if (statusFilter === "increase")
          return item.newScore > item.oldScore
        if (statusFilter === "decrease")
          return item.newScore < item.oldScore
        return true
      })
    }

    if (dateRange?.from) {
      result = result.filter((item) => {
        const updated = new Date(item.updatedAt)
        const from = new Date(dateRange.from!)
        const to = dateRange.to
          ? new Date(dateRange.to)
          : from
        return updated >= from && updated <= to
      })
    }

    return [...result].sort((a, b) => {
      const aTime = new Date(a.updatedAt).getTime()
      const bTime = new Date(b.updatedAt).getTime()
      return sortOrder === "desc"
        ? bTime - aTime
        : aTime - bTime
    })
  }, [
    rawHistoryList,
    debouncedSearch,
    statusFilter,
    dateRange,
    sortOrder,
  ])

  // virtualizer
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: filteredHistory.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 160,
    overscan: 5,
  })

  // 🔥 QUAN TRỌNG: re-measure khi sheet mở
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => {
        rowVirtualizer.measure()
        rowVirtualizer.scrollToIndex(0)
      }, 150) // đợi animation sheet xong

      return () => clearTimeout(t)
    }
  }, [open, rowVirtualizer])

  // infinite scroll đúng chuẩn
  useEffect(() => {
    const virtualItems =
      rowVirtualizer.getVirtualItems()

    const lastItem =
      virtualItems[virtualItems.length - 1]

    if (
      lastItem &&
      lastItem.index >=
        filteredHistory.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage()
    }
  }, [
    filteredHistory.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    rowVirtualizer,
  ])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[720px] p-0 flex flex-col"
      >
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-xl font-semibold flex items-center">
            <HistoryIcon className="mr-2" />
            Grade Change History
          </SheetTitle>
          <SheetDescription>
            View all history change grade
          </SheetDescription>
        </SheetHeader>

        {/* FILTER */}
        <div className="border-b px-6 pb-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search student..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="pl-9"
            />
          </div>

          <div className="flex gap-3 flex-wrap items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-baseline"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from
                    ? dateRange.to
                      ? `${format(
                          dateRange.from,
                          "PPP"
                        )} - ${format(
                          dateRange.to,
                          "PPP"
                        )}`
                      : format(
                          dateRange.from,
                          "PPP"
                        )
                    : "Select date range"}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                />
              </PopoverContent>
            </Popover>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  setSortOrder((prev) =>
                    prev === "desc"
                      ? "asc"
                      : "desc"
                  )
                }
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                {sortOrder === "desc"
                  ? "Newest"
                  : "Oldest"}
              </Button>

              <Select
                value={statusFilter}
                onValueChange={(v) =>
                  setStatusFilter(v as any)
                }
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All
                  </SelectItem>
                  <SelectItem value="increase">
                    Increase
                  </SelectItem>
                  <SelectItem value="decrease">
                    Decrease
                  </SelectItem>
                </SelectContent>
              </Select>

              <TooltipWrapper content="Clear filter">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setSearch("")
                    setStatusFilter("all")
                    setDateRange(undefined)
                    setSortOrder("desc")
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipWrapper>
            </div>
          </div>
        </div>

        {/* LIST */}
        <div
          ref={parentRef}
          className="flex-1 overflow-auto"
        >
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map(
                (_, i) => (
                  <div
                    key={i}
                    className="h-[120px] rounded-xl bg-muted animate-pulse"
                  />
                )
              )}
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <HistoryIcon className="h-10 w-10 mb-2 opacity-40" />
              No history found
            </div>
          ) : (
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: "relative",
              }}
            >
              {rowVirtualizer
                .getVirtualItems()
                .map((virtualRow) => {
                  const item =
                    filteredHistory[
                      virtualRow.index
                    ]

                  const increased =
                    item.newScore >
                    item.oldScore

                  return (
                    <div
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      className="absolute top-0 left-0 w-full px-6"
                      style={{
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <div className="border rounded-xl p-4 mb-4 bg-background">
                        <div className="flex justify-between mb-2">
                          <div className="font-semibold">
                            {item.student.name}
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              increased
                                ? "text-green-600 border-green-600"
                                : "text-red-600 border-red-600"
                            }
                          >
                            {item.changeType}
                          </Badge>
                        </div>

                        <div className="text-sm text-muted-foreground mb-2">
                          {item.column.name}
                        </div>

                        <div className="flex gap-3 mb-2 items-center">
                          <span className="line-through text-muted-foreground">
                            {item.oldScore}
                          </span>
                          <ArrowBigRight size={15} />
                          <span
                            className={
                              increased
                                ? "text-green-600 font-semibold"
                                : "text-red-600 font-semibold"
                            }
                          >
                            {item.newScore}
                          </span>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Reason: {item.reason}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Updated by{" "}
                          {item.updatedBy.name} •{" "}
                          {new Date(
                            item.updatedAt
                          ).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
