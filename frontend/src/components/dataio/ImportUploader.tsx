import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
  Download,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useImport } from "../../hooks/useImport";
import { downloadTemplate } from "../../api/dataio-api";
import ImportResultModal from "./ImportResultModal";
import { toast } from "sonner";

interface ImportUploaderProps {
  entity: string;
  apiUrl: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonVariant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
}

const ImportUploader = ({
  entity,
  apiUrl,
  title = `Import ${entity.charAt(0).toUpperCase() + entity.slice(1)}`,
  description,
  buttonText = "Import",
  buttonVariant = "default",
}: ImportUploaderProps) => {
  const [open, setOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const { loading, result, handleImport } = useImport();

  useEffect(() => {
    if (result && !loading) {
      setOpen(false);
      setResultOpen(true);
      clearFile();
    }
  }, [result, loading]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const onImport = async () => {
    if (!file) {
      alert("Vui lòng chọn file trước khi import");
      return;
    }
    await handleImport(apiUrl, file);
  };

  const clearFile = () => {
    setFile(null);
    const fileInput = document.getElementById(
      "import-file-upload",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
      clearFile();
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      await downloadTemplate(entity);
    } catch (error) {
      console.error("Error downloading template:", error);
      toast("Không thể tải template. Vui lòng thử lại.");
    } finally {
      setDownloadingTemplate(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant}>
          <Upload className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Download Template Section */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="flex-1">
              <p className="text-sm font-medium">Tải file mẫu</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tải xuống file Excel mẫu để biết định dạng dữ liệu
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              disabled={downloadingTemplate || loading}
            >
              {downloadingTemplate ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tải...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Tải Template
                </>
              )}
            </Button>
          </div>

          {/* File Upload Area */}
          <div className="space-y-4">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={onFileChange}
              className="hidden"
              id="import-file-upload"
              disabled={loading}
            />

            {!file && (
              <label htmlFor="import-file-upload">
                <div
                  className={`
                flex flex-col items-center justify-center 
                border-2 border-dashed rounded-lg p-8 
                cursor-pointer transition-all
                ${loading ? "opacity-50 cursor-not-allowed" : "hover:border-primary hover:bg-accent"}
                ${file ? "border-primary bg-accent" : "border-border"}
              `}
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                    {file ? (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    ) : (
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm font-medium mb-1">
                    {file ? "File đã chọn" : "Nhấn để chọn file"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Excel (.xlsx, .xls) hoặc CSV
                  </p>
                </div>
              </label>
            )}

            {/* File Info */}
            {file && (
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                <FileSpreadsheet className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFile}
                  disabled={loading}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Import Button */}
          <Button
            onClick={onImport}
            disabled={loading || !file}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang import...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Bắt đầu Import
              </>
            )}
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Result Modal - Separate */}
      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Kết quả Import
            </DialogTitle>
            <DialogDescription>
              Chi tiết kết quả import dữ liệu
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(90vh-180px)] py-4">
            {result && <ImportResultModal result={result} />}
          </div>

          <DialogFooter>
            <Button onClick={() => setResultOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default ImportUploader;
