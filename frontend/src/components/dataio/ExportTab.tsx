import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import type { ExportFormat } from "@/types/export";
import { Download, FileBarChart, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useState } from "react";

const exportOptions = [
    {
        format: "EXCEL" as ExportFormat,
        label: "Excel",
        description: "Download as Excel file (.xlsx)",
        icon: FileSpreadsheet,
    },
    {
        format: "CSV" as ExportFormat,
        label: "CSV",
        description: "Download as CSV file (.csv)",
        icon: FileText,
    },
    {
        format: "PDF" as ExportFormat,
        label: "PDF",
        description: "Download as PDF file (.pdf)",
        icon: FileBarChart,
    },
];

interface ExportTabProps {
    loading: boolean;
    onExport: (format: ExportFormat) => Promise<void>;
}

export function ExportTab({ loading, onExport }: ExportTabProps) {
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);

    const handleExportClick = async () => {
        if (!selectedFormat) return;

        try {
            await onExport(selectedFormat);
            setSelectedFormat(null);
        } catch (error) {
            console.error("Export error:", error);
        }
    };

    return (
        <TabsContent
            value="export"
            className="mt-2 min-h-[280px] flex flex-col justify-center gap-4"
        >
            <div className="text-center">
                <h3 className="text-lg font-semibold mb-1">Select Export Format</h3>
                <p className="text-sm text-muted-foreground">
                    Choose the format for your exported data
                </p>
            </div>

            <div className="space-y-2">
                {exportOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                        <div
                            key={option.format}
                            className={`p-3 cursor-pointer transition-all hover:bg-gray-100 rounded-xl border border-2 ${
                                selectedFormat === option.format
                                    ? "bg-gray-200 border-primary"
                                    : "hover:border-primary/50"
                            }`}
                            onClick={() => setSelectedFormat(option.format)}
                        >
                            <div className="flex items-center gap-4">
                                <IconComponent className="h-8 w-8 text-gray-500" />
                                <div className="flex-1">
                                    <h4 className="font-medium text-sm">{option.label}</h4>
                                    <p className="text-xs text-muted-foreground">
                                        {option.description}
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        name="export-format"
                                        value={option.format}
                                        checked={selectedFormat === option.format}
                                        onChange={() => setSelectedFormat(option.format)}
                                        className="h-4 w-4 text-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleExportClick}
                disabled={!selectedFormat || loading}
                size="lg"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Exporting...
                    </>
                ) : (
                    <>
                        <Download className="mr-2 h-5 w-5" />
                        Export File
                    </>
                )}
            </Button>
        </TabsContent>
    );
}
