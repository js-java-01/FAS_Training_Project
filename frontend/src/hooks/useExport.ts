import { useState } from "react";
import { downloadBlob } from "@/utils/downloadBlob";
import type { ExportFormat } from "@/types/export";
import { exportFileApi } from "@/api/axiosInstance";

type FilenameMap = Record<ExportFormat, string>;

export function useExport(exportUrl: string, filenameMap: FilenameMap) {
    const [loading, setLoading] = useState(false);

    const exportFile = async (format: ExportFormat) => {
        try {
            setLoading(true);

            const res = await exportFileApi(exportUrl, format);

            const contentType =
                format === "EXCEL"
                    ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    : format === "CSV"
                      ? "text/csv"
                      : "application/pdf";

            const blob = new Blob([res.data], {
                type: contentType,
            });

            downloadBlob(blob, filenameMap[format]);
        } catch (err) {
            console.error("Export failed", err);
            alert("Export failed");
        } finally {
            setLoading(false);
        }
    };

    return {
        exportFile,
        loading,
    };
}
