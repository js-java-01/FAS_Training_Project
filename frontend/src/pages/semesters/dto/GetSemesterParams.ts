export type GetSemestersParams = {
  page: number;
  size: number;
  sort?: string | string[];
  keyword?: string;
  startDate?: string;
  endDate?: string;
  unpaged: boolean;
};
