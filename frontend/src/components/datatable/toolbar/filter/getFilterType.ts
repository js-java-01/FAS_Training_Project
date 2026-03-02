import type { FieldSchema, FilterType } from "@/types/common/datatable";

/**
 * Xác định loại filter phù hợp cho một field dựa trên `filterType` hoặc `type`.
 */
export function getFilterType(field: FieldSchema): FilterType {
  if (field.filterType) return field.filterType;

  switch (field.type) {
    case "boolean":
      return "boolean";
    case "select":
    case "relation":
      return "select";
    case "date":
      return "dateRange";
    case "number":
      return "numberRange";
    default:
      return "text";
  }
}
