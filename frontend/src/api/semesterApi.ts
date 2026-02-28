import type { SemesterResponse } from "@/pages/semesters/dto/SemesterResponse";
import axiosInstance from "./axiosInstance";
import type { GetSemestersParams } from "@/pages/semesters/dto/GetSemesterParams";
import type { ApiResponse, PagedData } from "@/types/response";
import type { UpdateSemesterRequest } from "@/pages/semesters/dto/UpdateSemesterRequest";
import type { CreateSemesterRequest } from "@/pages/semesters/dto/CreateSemesterRequest";

export const semesterApi = {
  getAllSemesters: async (params: GetSemestersParams) => {
    const res = await axiosInstance.get<ApiResponse<PagedData<SemesterResponse>>>("/semesters", { params });
    return res.data;
  },
  getSemesters: async (params: GetSemestersParams) => {
    const res = await axiosInstance.get<ApiResponse<PagedData<SemesterResponse>>>("/semesters/my-semesters", {
      params,
    });
    return res.data;
  },

  createSemester: async (data: CreateSemesterRequest) => {
    const res = await axiosInstance.post("/semesters", data);
    return res;
  },

  updateSemester: async (data: UpdateSemesterRequest) => {
    const res = await axiosInstance.put("/semesters/update", data);
    return res;
  },

  deleteSemester: async (id: string) => {
    await axiosInstance.delete(`/semesters/delete/${id}`);
  },

  exportSemesters: async () => {
    const res = await axiosInstance.get("/semesters/export", { responseType: "blob" });
    return res.data;
  },

  importSemesters: async (formData: FormData) => {
    return await axiosInstance.post("/semesters/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  exportTemplateSemesters: async () => {
    const res = await axiosInstance.get("/semesters/template", { responseType: "blob" });
    return res.data;
  },
};
