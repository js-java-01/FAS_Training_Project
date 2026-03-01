import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface CustomPaginationProps {
    pageIndex: number;
    totalPages: number;
    setPageIndex: (page: number) => void;
}

const CustomPagination = ({ pageIndex, totalPages, setPageIndex }: CustomPaginationProps) => {
    if (totalPages <= 1) return null;
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const siblingCount = 1;

        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i);
        }

        const leftSiblingIndex = Math.max(pageIndex - siblingCount, 0);
        const rightSiblingIndex = Math.min(pageIndex + siblingCount, totalPages - 1);

        const shouldShowLeftDots = leftSiblingIndex > 1;
        const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

        pages.push(0);

        if (shouldShowLeftDots) {
            pages.push("dots-left");
        } else if (leftSiblingIndex > 0) {
            for (let i = 1; i < leftSiblingIndex; i++) pages.push(i);
        }

        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
            if (i !== 0 && i !== totalPages - 1) {
                pages.push(i);
            }
        }

        if (shouldShowRightDots) {
            pages.push("dots-right");
        } else if (rightSiblingIndex < totalPages - 1) {
            for (let i = rightSiblingIndex + 1; i < totalPages - 1; i++) pages.push(i);
        }

        pages.push(totalPages - 1);
        return pages;
    };

    const pages = getPageNumbers();

    return (
        <Pagination className="justify-end my-4">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (pageIndex > 0) setPageIndex(pageIndex - 1);
                        }}
                        className={pageIndex === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                </PaginationItem>

                {pages.map((page, index) => {
                    if (page === "dots-left" || page === "dots-right") {
                        return (
                            <PaginationItem key={`dots-${index}`}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        );
                    }

                    return (
                        <PaginationItem key={index} className="hidden sm:inline-block">
                            <PaginationLink
                                href="#"
                                isActive={pageIndex === page}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setPageIndex(page as number);
                                }}
                            >
                                {(page as number) + 1}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (pageIndex < totalPages - 1) setPageIndex(pageIndex + 1);
                        }}
                        className={pageIndex >= totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};

export default CustomPagination