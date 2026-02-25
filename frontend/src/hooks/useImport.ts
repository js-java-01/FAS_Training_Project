import { importFileApi } from "@/api/dataio-api";
import { useState } from "react";
import { toast } from "sonner";

export const useImport = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleImport = async (url: string, file: File) => {
    setLoading(true);
    try {
      const res = await importFileApi(url, file);
      setResult(res.data);
    } catch (e) {
      toast("Import failed");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    result,
    handleImport,
  };
};