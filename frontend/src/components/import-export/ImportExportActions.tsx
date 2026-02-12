import { FiUploadCloud, FiDownload } from "react-icons/fi";

interface Props {
  onImportClick?: () => void;
  onExportClick?: () => void;
  importLabel?: string;
  exportLabel?: string;
}

export const ImportExportActions = ({
  onImportClick,
  onExportClick,
  importLabel = "Import",
  exportLabel = "Export",
}: Props) => {
  return (
    <div className="flex gap-2">
      {onImportClick && (
        <button
          onClick={onImportClick}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md font-semibold hover:bg-gray-100"
        >
          <FiUploadCloud /> {importLabel}
        </button>
      )}

      {onExportClick && (
        <button
          onClick={onExportClick}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md font-semibold hover:bg-gray-100"
        >
          <FiDownload /> {exportLabel}
        </button>
      )}
    </div>
  );
};
