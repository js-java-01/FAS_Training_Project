import { Button } from "@/components/ui/button";
import {
  Pagination as PaginationComponent,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import { usePagination } from "@/hooks/usePagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ActionButton from "./ActionButton";

export function Pagination({ table }: { table: any }) {
  const totalPages = Math.ceil(table.total / table.size) || 1;
  const currentPage = table.page + 1;

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage,
    totalPages,
    paginationItemsToDisplay: 5,
  });

  const canPreviousPage = table.page > 0;
  const canNextPage = table.page < totalPages - 1;

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      {table.selected?.length >= 0 && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {table.selected?.length || 0}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground">
            {table.total || table.data?.length || 0}
          </span>{" "}
          rows selected
        </div>
      )}

      <div className="flex flex-col items-end gap-5 sm:flex-row sm:items-center">
        <div
          className="text-sm text-muted-foreground whitespace-nowrap"
          aria-live="polite"
        >
          Page{" "}
          <span className="font-medium text-foreground">{currentPage}</span> of{" "}
          <span className="font-medium text-foreground">{totalPages}</span>
        </div>

        <PaginationComponent>
          <PaginationContent>
            <PaginationItem>
              <ActionButton
                onClick={() => table.setPage(table.page - 1)}
                disabled={!canPreviousPage}
                icon={<ChevronLeft size={16} />}
                variant="secondary"
                tooltip="Previous page"
              />
            </PaginationItem>

            {showLeftEllipsis && <PaginationEllipsis />}

            {pages.map((p) => (
              <PaginationItem key={p}>
                <Button
                  size="icon"
                  variant={p === currentPage ? "default" : "outline"}
                  onClick={() => table.setPage(p - 1)}
                >
                  {p}
                </Button>
              </PaginationItem>
            ))}

            {showRightEllipsis && <PaginationEllipsis />}

            <PaginationItem>
              <ActionButton
                onClick={() => table.setPage(table.page + 1)}
                disabled={!canNextPage}
                icon={<ChevronRight size={16} />}
                variant="secondary"
                tooltip="Next page"
              />
            </PaginationItem>
          </PaginationContent>
        </PaginationComponent>
      </div>
    </div>
  );
}
