import "@tanstack/react-table";

declare module "@tanstack/react-table" {
    interface ColumnMeta {
        filterVariant?: string;
        filterOptions?: string[] | number[];
        labelOptions?: Record<string, string>;
        title?: string;
    }
}