import { useQuery } from "@tanstack/react-query";
import { semesterApi } from "@/api/semesterApi";
import { trainingClassKeys } from "../../../training-classes/keys";
import type { GetSemestersParams } from "../../dto/GetSemesterParams";
import type { PagedData } from "@/types/response";
import type { SemesterResponse } from "@/types/trainingClass";

export const useGetAllSemesters = (params: GetSemestersParams, role: string) => {
  return useQuery<PagedData<SemesterResponse>>({
    queryKey: [...trainingClassKeys.semesters(params), role],
    queryFn: async () => {
      if (role === "ADMIN") {
        const res = await semesterApi.getAllSemesters(params);
        return res.data;
      } else {
        const res = await semesterApi.getSemesters(params);
        return res.data;
      }
    },
    staleTime: 10 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
};
