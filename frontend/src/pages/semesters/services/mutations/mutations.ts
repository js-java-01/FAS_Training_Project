import { useMutation } from "@tanstack/react-query";
import { semesterApi } from "@/api/semesterApi";

/* ========= EXPORT ========= */
export const useExportSemesters = () => {
  return useMutation({
    mutationFn: async () => {
      return await semesterApi.exportSemesters();
    },
  });
};

/* ========= IMPORT ========= */
export const useImportSemesters = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await semesterApi.importSemesters(formData);
      console.log(res.data);
      return res.data;
    },
  });
};

/* ========= DOWNLOAD TEMPLATE ========= */
export const useDownloadTemplate = () => {
  return useMutation({
    mutationFn: async () => {
      return await semesterApi.exportTemplateSemesters(); // Trả về Blob
    },
  });
};
