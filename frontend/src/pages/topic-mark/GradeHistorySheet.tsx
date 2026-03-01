import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Loader2,
  HistoryIcon,
  Search,
  RotateCcw,
} from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import {
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react"
import { useInfiniteGradeHistory } from "./services/mutations"
import { TooltipWrapper } from "@/components/TooltipWrapper"

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
  const [statusFilter, setStatusFilter] = useState<
    "all" | "increase" | "decrease"
  >("all")
  const [dateRange, setDateRange] =
    useState<DateRange | undefined>()
  const [sortOrder, setSortOrder] =
    useState<"desc" | "asc">("desc")

  // Reset filters when sheet closes
  useEffect(() => {
    if (!open) {
      clearFilters()
    }
  }, [open])

  const clearFilters = () => {
    setSearch("")
    setStatusFilter("all")
    setDateRange(undefined)
    setSortOrder("desc")
  }

  const isFiltering =
    search ||
    statusFilter !== "all" ||
    dateRange?.from ||
    sortOrder !== "desc"

  const filters = useMemo(() => {
    return {
      courseClassId,
      studentName: search || undefined,
      status:
        statusFilter === "all"
          ? undefined
          : statusFilter.toUpperCase(),
      fromDate: dateRange?.from
        ? dateRange.from.toISOString().split("T")[0]
        : undefined,
      toDate: dateRange?.to
        ? dateRange.to.toISOString().split("T")[0]
        : undefined,
      sort: `updatedAt,${sortOrder}`,
    }
  }, [
    search,
    statusFilter,
    dateRange,
    sortOrder,
    courseClassId,
  ])

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteGradeHistory(filters)

  const historyList =
    data?.pages.flatMap((p) => p.content) ?? []

  const loadMoreRef = useRef<HTMLDivElement | null>(
    null
  )

  useEffect(() => {
    if (!loadMoreRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          fetchNextPage()
        }
      },
      { threshold: 1 }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[720px] p-0 flex flex-col"
      >
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-xl font-semibold flex items-center">
            <HistoryIcon className="mr-2" /> Grade Change History
          </SheetTitle>
        </SheetHeader>

        {/* FILTER */}
        <div className="border-b px-6 pb-4 space-y-4">
          {/* SEARCH */}
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
            {/* DATE */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full"
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

              <PopoverContent
                align="start"
                className="p-0"
              >
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>

            <div className="flex gap-4 items-center">
              {/* SORT */}
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

              {/* STATUS */}
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

              {/* CLEAR FILTER */}
              <TooltipWrapper content="Clear filter">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={clearFilters}
                  disabled={!isFiltering}
                  className="hover:bg-muted transition"
                >
                  <RotateCcw
                    className={`h-4 w-4 transition-transform duration-300 ${
                      isFiltering
                        ? "hover:rotate-180"
                        : ""
                    }`}
                  />
                </Button>
             </TooltipWrapper>
            </div>
          </div>
        </div>

        {/* LIST */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-4">
            {isLoading && (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading &&
              historyList.map((item: any) => {
                const increased =
                  item.changeType ===
                  "INCREASE"

                return (
                  <div
                    key={item.id}
                    className="border rounded-xl p-4"
                  >
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

                    <div className="flex gap-3 mb-2">
                      <span className="line-through text-muted-foreground">
                        {item.oldScore}
                      </span>
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
                )
              })}

            {!isLoading && (
              <div
                ref={loadMoreRef}
                className="h-16 flex items-center justify-center text-sm text-muted-foreground"
              >
                {isFetchingNextPage ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading more...
                  </div>
                ) : hasNextPage ? (
                  "Scroll to load more"
                ) : (
                  "No more data"
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
