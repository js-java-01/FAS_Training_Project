import { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Upload,
    Trash2,
    ImportIcon,
    FileSpreadsheet,
    Download,
} from "lucide-react";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function ImportExportModal({
    title,
    open,
    setOpen,
    onImport,
    onExport,
    onDownloadTemplate,
}: {
    title?: string;
    open: boolean;
    setOpen: (open: boolean) => void;
    onImport: (file: File) => Promise<void>;
    onExport: () => Promise<void>;
    onDownloadTemplate: () => Promise<void>;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    /* ================= VALIDATE FILE ================= */
    const validateFile = (file: File): boolean => {
        if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
            setError("Only Excel files (.xlsx, .xls) are allowed");
            return false;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError("File size must be less than 50MB");
            return false;
        }

        return true;
    };

    /* ================= FILE SELECT ================= */
    const handleFileSelect = (file: File | null) => {
        if (!file) return;
        if (!validateFile(file)) return;

        setFile(file);
        setError(null);
    };

    /* ================= IMPORT ================= */
    const handleImportClick = async () => {
        if (!file || loading) return;

        try {
            setLoading(true);
            setError(null);
            await onImport(file); // parent handle toast
            setFile(null);
            setOpen(false);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Failed to import data");
        } finally {
            setLoading(false);
        }
    };

    /* ================= EXPORT ================= */
    const handleExportClick = async () => {
        try {
            setLoading(true);
            await onExport();
        } finally {
            setLoading(false);
        }
    };

    /* ================= TEMPLATE ================= */
    const handleDownloadTemplate = async () => {
        try {
            setLoading(true);
            await onDownloadTemplate();
        } finally {
            setLoading(false);
        }
    };

    /* ================= DRAG & DROP ================= */
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (loading) return;
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        if (loading) return;
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        if (loading) return;
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files?.[0];
        handleFileSelect(droppedFile ?? null);
    };

    /* ================= REMOVE FILE ================= */
    const handleRemoveFile = () => {
        setFile(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-xl min-h-[440px] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Import & Export Data {title}</DialogTitle>
                    <DialogDescription>
                        Bulk import data or export your records for backup and analysis
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="import" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="import">Import</TabsTrigger>
                        <TabsTrigger value="export">Export</TabsTrigger>
                    </TabsList>

                    {/* ================= IMPORT ================= */}
                    <TabsContent
                        value="import"
                        className="mt-6 space-y-4 min-h-[280px] flex flex-col justify-between"
                    >

                        {/* DROP ZONE */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`
                                flex flex-col items-center justify-center
                                border-2 border-dashed rounded-xl p-8 text-center gap-3
                                transition-colors
                                ${isDragging ? "border-blue-600 bg-blue-50" : "border-muted"}
                                ${loading ? "opacity-50 pointer-events-none" : ""}
                            `}
                        >
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm font-medium">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Excel files (.xls, .xlsx) up to 50MB
                            </p>

                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                className="hidden"
                                disabled={loading}
                                onChange={(e) =>
                                    handleFileSelect(e.target.files?.[0] ?? null)
                                }
                            />

                            <div className="flex gap-2 mt-2">
                                <Button
                                    className=" bg-blue-600 text-white"
                                    disabled={loading}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <FileSpreadsheet />
                                    Choose file
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDownloadTemplate}
                                    disabled={loading}
                                    className="gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Download template
                                </Button>
                            </div>
                        </div>

                        {/* FILE INFO */}
                        {file && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm border rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                        <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                        <span className="truncate max-w-[240px]">
                                            {file.name}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={handleImportClick}
                                            disabled={loading}
                                            className={
                                                loading
                                                    ? "bg-gray-400 hover:bg-gray-400"
                                                    : "bg-green-600 text-white"
                                            }
                                        >
                                            <ImportIcon className="h-4 w-4 mr-1" />
                                            {loading ? "Importing..." : "Import"}
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            disabled={loading}
                                            onClick={handleRemoveFile}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-sm text-red-600">{error}</p>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    {/* ================= EXPORT ================= */}
                    <TabsContent
                        value="export"
                        className="mt-6 min-h-[260px] flex flex-col justify-center items-center text-center gap-4"
                    >
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">
                                Export {title ?? "Data"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Export your data in Excel format for backup or analysis.
                            </p>
                        </div>

                        <Button
                            className="w-48 bg-blue-600 text-white"
                            onClick={handleExportClick}
                            disabled={loading}
                        >
                            {loading ? "Exporting..." : "Export File"}
                        </Button>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}