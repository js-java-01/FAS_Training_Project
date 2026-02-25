import type { ExportFormat } from "@/types/export";
import axiosInstance from "./axiosInstance";

export const importFileApi = (url: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return axiosInstance.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const exportFileApi = (url: string, format: ExportFormat) => {
  return axiosInstance.get(url, {
    params: { format },
    responseType: "blob",
  });
};

export const downloadTemplate = async (entity: string) => {
  const res = await axiosInstance.get(`/import/template?entity=${entity}`, {
    responseType: "blob"
  });

  const url = window.URL.createObjectURL(res.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${entity}-template.xlsx`;
  link.click();
};