import { useState } from "react";
import { useExport } from "@/hooks/useExport";
import type { ExportFormat } from "@/types/export";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileText, FileSpreadsheet, FileBarChart } from "lucide-react";

type Props = {
    apiUrl: string;
};

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

export function ExportSelectButton({ apiUrl }: Props) {
    const { exportFile, loading } = useExport(apiUrl);
    const [open, setOpen] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);

    const handleExport = () => {
        if (selectedFormat) {
            exportFile(selectedFormat);
            setOpen(false);
            setSelectedFormat(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Select Export Format</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-4">
                    {exportOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                            <Card
                                key={option.format}
                                className={`p-3 cursor-pointer transition-all hover:bg-gray-100 ${
                                    selectedFormat === option.format
                                        ? "ring-1 ring-primary bg-gray-100"
                                        : "border-border hover:border-primary/50"
                                }`}
                                onClick={() => setSelectedFormat(option.format)}
                            >
                                <div className="flex items-center gap-3">
                                    <IconComponent className="h-8 w-8 text-gray-500" />
                                    <div className="flex-1">
                                        <h4 className="font-medium text-sm">{option.label}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
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
                            </Card>
                        );
                    })}
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setOpen(false);
                            setSelectedFormat(null);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleExport} disabled={!selectedFormat || loading} className="gap-2">
                        {loading ? "Exporting..." : "Export"}
                        {!loading && <Download className="h-4 w-4" />}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
