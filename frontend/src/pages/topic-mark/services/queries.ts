import { useQuery } from "@tanstack/react-query"
import { topicMarkApi } from "@/api/topicMarkApi"

export const useGetCourseByClassId = (id: string) => {
  return useQuery({
    queryKey: ["course-by-class", id],
    queryFn: () => topicMarkApi.getCourseByClassId(id),
    enabled: !!id,
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  })
}

interface GradebookParams {
  id: string
  page: number
  pageSize: number
  sort?: string
  keyword?: string
  enabled?: boolean
}

export const useGetGradebookTable = ({
  id,
  page,
  pageSize,
  sort,
  keyword,
  enabled = true,
}: GradebookParams) => {
  return useQuery({
    queryKey: [
      "gradebook-table",
      id,
      page,
      pageSize,
      sort,
      keyword,
    ],
    queryFn: () =>
      topicMarkApi.getTopicMarksById({
        id,
        page,
        pageSize,
        sort: sort ?? "fullName,asc",
        ...(keyword?.trim()
          ? { keyword: keyword.trim() }
          : {}),
      }),
    enabled: enabled && !!id,
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  })
}
