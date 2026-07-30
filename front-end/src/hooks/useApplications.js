import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import applicationService from "../services/applicationService";

const extractErrorMessage = (error) =>
  error?.response?.data?.message || "Something went wrong. Please try again.";

export const useApplicationsQuery = (params) =>
  useQuery({
    queryKey: ["applications", params],
    queryFn: async () => {
      const { data } = await applicationService.list(params);
      return data;
    },
    placeholderData: (prev) => prev,
  });

export const useApplicationQuery = (applicationId) =>
  useQuery({
    queryKey: ["applications", applicationId],
    queryFn: async () => {
      const { data } = await applicationService.show(applicationId);
      return data.data;
    },
    enabled: !!applicationId,
  });

export const useUpdateApplicationStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, payload }) => applicationService.updateStatus(applicationId, payload),
    onSuccess: (response, { applicationId }) => {
      toast.success(response.data.message ?? "Status updated");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["applications", applicationId] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useRecomputeMatchScoreMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: applicationService.recomputeMatchScore,
    onSuccess: (response, applicationId) => {
      toast.success("Match score recomputed");
      queryClient.invalidateQueries({ queryKey: ["applications", applicationId] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useSkillGapQuery = (applicationId, enabled) =>
  useQuery({
    queryKey: ["applications", applicationId, "skill-gap"],
    queryFn: async () => {
      const { data } = await applicationService.skillGap(applicationId);
      return data.data;
    },
    enabled: !!applicationId && !!enabled,
  });
