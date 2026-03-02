import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload,
  ImportIcon,
  FileSpreadsheet,
  Download,
  AlertCircle,
  XCircle,
} from "lucide-react";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export interface ImportResult {
  message: string;
  totalRows: number;
  successCount: number;
  failedCount: number;
  errors: {
    row: number;
    field: string;
    message: string;
  }[];
}

interface Props {
  onImport?: (file: File) => Promise<ImportResult | void>;
  onDownloadTemplate?: () => Promise<void>;
  acceptedFileTypes?: string;
  validateFile?: (file: File) => string | null;
}

export default function ImportTab({
  onImport,
  onDownloadTemplate,
  acceptedFileTypes = ".xlsx, .xls",
  validateFile,
}: Props) {
  /* ================= STATE ================= */

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ================= UTIL ================= */

  const formatSize = (size: number) => {
    const mb = size / (1024 * 1024);
    return mb >= 1
      ? `${mb.toFixed(2)} MB`
      : `${(size / 1024).toFixed(1)} KB`;
  };

  /* ================= VALIDATE FILE ================= */

  const validateSelectedFile = (selected: File): boolean => {
    if (validateFile) {
      const errorMessage = validateFile(selected);
      if (errorMessage) {
        setError(errorMessage);
        return false;
      }
    } else {
      if (!selected.name.match(/\.(xlsx|xls)$/i)) {
        setError("Invalid file format. Only Excel files (.xlsx, .xls) allowed.");
        return false;
      }

      if (selected.size > MAX_FILE_SIZE) {
        setError("File size exceeds 50MB limit.");
        return false;
      }
    }

    return true;
  };

  const handleFileSelect = (selected: File | null) => {
    if (!selected) return;

    setError(null);
    setResult(null);

    if (!validateSelectedFile(selected)) return;

    setFile(selected);
  };

  /* ================= IMPORT ================= */

  const handleImportClick = async () => {
    if (!file || loading || !onImport) return;

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const res = await onImport(file);

      if (res) {
        setResult(res);
      }

      const isFullSuccess =
        !res || (typeof res === "object" && res?.failedCount === 0);

      if (isFullSuccess) {
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (err: any) {
      const errorData = err?.response?.data;

      if (errorData && typeof errorData.totalRows === "number") {
        setResult(errorData);
      } else {
        setError(
          errorData?.message ??
            "Import failed. Please check your file and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* REQUIREMENTS */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg text-sm">
        <div className="flex gap-3 p-4">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900">
              File Format Requirements
            </p>
            <ul className="mt-2 space-y-1 text-blue-800 text-xs">
              <li>• Excel files only (.xlsx, .xls)</li>
              <li>• Maximum size: 50MB</li>
              <li>• Follow template structure strictly</li>
            </ul>
          </div>
        </div>
      </div>

      {/* STEP 1 */}
      <div>
        <h3 className="font-semibold text-sm">Step 1: Download Template</h3>
        <p className="text-xs text-muted-foreground mb-2">
          Download official template to ensure correct structure.
        </p>

        <Button
          size="sm"
          onClick={() => onDownloadTemplate?.()}
          disabled={loading || !onDownloadTemplate}
          className="bg-green-600 hover:bg-green-700"
        >
          <Download className="h-4 w-4 mr-1" />
          Download Template
        </Button>
      </div>

      {/* STEP 2 */}
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
                Supported: {acceptedFileTypes.replace(/,/g, ", ")}
              </p>
            </>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
              </div>

              <div className="text-left">
                <p className="text-sm font-semibold truncate max-w-55">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(file.size)}
                </p>
              </div>
            </div>
          )}

          <Input
            ref={fileInputRef}
            type="file"
            accept={acceptedFileTypes}
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

          {file && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-red-500"
              onClick={handleRemoveFile}
            >
              Remove file
            </Button>
          )}
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm flex justify-between items-start gap-3">
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <span>{error}</span>
          </div>

          <button onClick={() => setError(null)}>
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* STEP 3 */}
      {file && (
        <div className="border rounded-xl p-5 bg-white shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold">{file.name}</p>

            <Button
              onClick={handleImportClick}
              disabled={loading || !file || !!error || !onImport}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-6"
            >
              <ImportIcon className="h-4 w-4 mr-1" />
              {loading ? "Importing..." : "Start Import"}
            </Button>
          </div>
        </div>
      )}

      {/* RESULT */}
      {result && (
        <div className="border rounded-xl p-6 bg-white shadow-sm space-y-5">
          <div>
            <h3 className="font-semibold text-base">Import Result</h3>
            <p className="text-sm text-muted-foreground">{result.message}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <StatCard label="Total" value={result.totalRows} />
            <StatCard label="Success" value={result.successCount} color="green" />
            <StatCard label="Failed" value={result.failedCount} color="red" />
          </div>

          {result.failedCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-700 mb-3 flex gap-2">
                <AlertCircle size={18} />
                Failed Records
              </p>

              <div className="max-h-56 overflow-y-auto space-y-2 text-sm">
                {result.errors.map((err, index) => (
                  <div
                    key={index}
                    className="bg-white border rounded-md px-3 py-2"
                  >
                    <p>
                      Row <span className="font-medium">{err.row}</span> —{" "}
                      <span className="font-medium">{err.field}</span>
                    </p>
                    <p className="text-red-600 text-xs">{err.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ================= STAT CARD ================= */

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: "green" | "red";
}) {
  const colorMap = {
    green: "text-green-600",
    red: "text-red-600",
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`text-xl font-semibold mt-1 ${
          color ? colorMap[color] : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
