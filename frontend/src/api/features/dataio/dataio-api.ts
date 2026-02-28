import type { FileFormat } from "@/types/enum/file-format";
import axiosInstance from "../axiosInstance";
import { downloadBlob, getFilenameFromHeader } from "@/utils/dataio.utils";

export const importFileApi = (url: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return axiosInstance.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const exportFileApi = (url: string, format: FileFormat) => {
  return axiosInstance.get(url, {
    params: { format },
    responseType: "blob",
  });
};

export const downloadTemplate = async (entity: string) => {
  const res = await axiosInstance.get(`/import/template?entity=${entity}`, {
    responseType: "blob"
  });

  const contentDisposition = res.headers["content-disposition"];
  const filename = getFilenameFromHeader(contentDisposition);

  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  downloadBlob(blob, filename || undefined);
};