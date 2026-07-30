import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import candidateApplicationService from "../services/candidateApplicationService";

const extractErrorMessage = (error) =>
  error?.response?.data?.message || "Something went wrong. Please try again.";

export const useMyApplicationsQuery = (params) =>
  useQuery({
    queryKey: ["candidate", "applications", params],
    queryFn: async () => {
      const { data } = await candidateApplicationService.list(params);
      return data;
    },
    placeholderData: (prev) => prev,
  });

export const useApplyToJobMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: candidateApplicationService.apply,
    onSuccess: (response) => {
      toast.success(response.data.message ?? "Application submitted");
      queryClient.invalidateQueries({ queryKey: ["candidate", "applications"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};
