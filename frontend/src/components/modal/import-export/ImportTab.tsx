import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload,
  Trash2,
  ImportIcon,
  FileSpreadsheet,
  Download,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { TooltipWrapper } from "@/components/TooltipWrapper";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export default function ImportTab({
  onImport,
  onDownloadTemplate,
}: {
  onImport: (file: File) => Promise<void>;
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
      setError(
        "Invalid file format. Only Excel files (.xlsx, .xls) are allowed.",
      );
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size exceeds 50MB limit.");
      return false;
    }

    return true;
  };

  /* ================= FILE SELECT ================= */
  const handleFileSelect = (selected: File | null) => {
    if (!selected) return;

    setError(null);

    if (!validateFile(selected)) return;

    setFile(selected);
  };

  /* ================= IMPORT ================= */
  const handleImportClick = async () => {
    if (!file || loading) return;

    try {
      setLoading(true);
      setError(null);

      await onImport(file);

      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Import failed. Please check your file and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= REMOVE FILE ================= */
  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      {/* ================= REQUIREMENT BOX ================= */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg text-sm">
        <div className="flex gap-3 p-4">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900">
              File Format Requirements
            </p>
            <ul className="mt-2 space-y-1 text-blue-800 text-xs">
              <li>• Excel files only (.xlsx, .xls)</li>
              <li>• Maximum file size: 50MB</li>
              <li>• Follow template structure strictly</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ================= STEP 1 ================= */}
      <div>
        <h3 className="font-semibold text-sm">Step 1: Download Template</h3>
        <p className="text-xs text-muted-foreground mb-2">
          Download the official Excel template to ensure correct structure.
        </p>

        <Button
          size="sm"
          onClick={onDownloadTemplate}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          <Download className="h-4 w-4 mr-1" />
          Download Template
        </Button>
      </div>

      {/* ================= STEP 2 ================= */}
      <div>
        <h3 className="font-semibold text-sm">Step 2: Select File</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Upload your completed Excel file.
        </p>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileSelect(e.dataTransfer.files?.[0] ?? null);
          }}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition
            ${isDragging ? "border-blue-600 bg-blue-50" : ""}
            ${error ? "border-red-400 bg-red-50" : "border-gray-300"}
          `}
        >
          {!file ? (
            <>
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm mt-2 font-medium">
                Click or drag & drop file
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: .xlsx, .xls
              </p>
            </>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold truncate max-w-[220px]">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB • Ready to import
                </p>
              </div>
            </div>
          )}

          <Input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
          />

          <Button
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
          >
            {file ? "Change File" : "Choose File"}
          </Button>
        </div>
      </div>

      {/* ================= ERROR ALERT ================= */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm flex justify-between items-start gap-3">
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <span>{error}</span>
          </div>

          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ================= STEP 3 ================= */}
      {file && (
        <div className="mt-6">
          <h3 className="font-semibold text-sm mb-3">
            Step 3: Confirm & Import
          </h3>

          <div className="border rounded-xl p-5 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <p className="text-sm font-semibold">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                Ready
              </span>
            </div>

            <div className="h-px bg-gray-100" />

            <div className="flex justify-between items-center">
              <Button
                onClick={handleImportClick}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-6"
              >
                <ImportIcon className="h-4 w-4 mr-1" />
                {loading ? "Importing..." : "Start Import"}
              </Button>

              <TooltipWrapper content="Remove file">
                <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TooltipWrapper>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
