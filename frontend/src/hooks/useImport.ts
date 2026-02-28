import { importFileApi } from "@/api/service/dataio-api";
import { useState } from "react";
import { toast } from "sonner";

export const useImport = (url: string) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleImport = async (file: File) => {
    setLoading(true);
    try {
      const res = await importFileApi(url, file);
      setResult(res.data);
    } catch (e) {
      console.error("Import failed", e);
      toast.error("Import failed");
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