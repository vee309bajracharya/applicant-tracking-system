import { useQuery } from "@tanstack/react-query";
import dashboardService from "../services/dashboardService";

export const useDashboardQuery = () =>
  useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data } = await dashboardService.get();
      return data.data;
    },
    staleTime: 60 * 1000,
  });
