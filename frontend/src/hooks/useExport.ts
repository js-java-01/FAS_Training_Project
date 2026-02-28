import { exportFileApi } from "@/api/service/dataio-api";
import type { FileFormat } from "@/types/enum/file-format";
import { downloadBlob, getFilenameFromHeader } from "@/utils/dataio.utils";
import { useState } from "react";
import { toast } from "sonner";

export function useExport(exportUrl: string) {
  const [loading, setLoading] = useState(false);

  const exportFile = async (format: FileFormat) => {
    try {
      setLoading(true);

      const res = await exportFileApi(exportUrl, format);

      const contentDisposition = res.headers["content-disposition"];
      const filename = getFilenameFromHeader(contentDisposition);

      const contentType =
        format === "EXCEL"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : format === "CSV"
          ? "text/csv"
          : "application/pdf";

      const blob = new Blob([res.data], { type: contentType });

      downloadBlob(blob, filename || undefined);

    } catch (err) {
      console.error("Export failed", err);
      toast.error("Export failed");
    } finally {
      setLoading(false);
    }
  };

  return {
    exportFile,
    loading,
  };
}