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
import { Upload, FileText, Trash2 } from "lucide-react";

export default function ImportExportModal({
                                              title,
                                              open,
                                              setOpen,
                                              onImport,
                                              onExport,
                                          }: {
    title?: string;
    open: boolean;
    setOpen: (open: boolean) => void;
    onImport: (file: File) => Promise<void>;
    onExport: () => Promise<void>;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = async () => {
        if (!file) return;

        try {
            setLoading(true);
            setError(null);
            await onImport(file); // success → parent lo toast + close
            setFile(null);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ?? "Failed to import module groups"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleExportClick = async () => {
        try {
            setLoading(true);
            await onExport();
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-xl min-h-[420px] flex flex-col">
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
                        className="mt-6 space-y-4 min-h-[260px] flex flex-col justify-between"
                    >
                        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center gap-3">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm font-medium">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Excel files up to 50MB
                            </p>

                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                className="hidden"
                                onChange={(e) => {
                                    setFile(e.target.files?.[0] ?? null);
                                    setError(null); // reset lỗi khi chọn file mới
                                }}
                            />

                            <Button
                                className="w-48 bg-blue-600 text-white"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Choose file
                            </Button>
                        </div>

                        {file && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm border rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
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
                                            loading ? "bg-gray-400 hover:bg-gray-400" : "bg-green-600 text-white"
                                            }
                                        >
                                            {loading ? "Importing..." : "Import"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={handleRemoveFile}
                                            disabled={loading}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>

                                    </div>
                                </div>

                                {/* ERROR MESSAGE */}
                                {error && (
                                    <p className="text-sm text-red-600">
                                        {error}
                                    </p>
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
