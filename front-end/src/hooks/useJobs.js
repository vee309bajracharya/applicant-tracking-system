import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import jobService from "../services/jobService";

const extractErrorMessage = (error) =>
  error?.response?.data?.message || "Something went wrong. Please try again.";

export const useJobsQuery = (params) =>
  useQuery({
    queryKey: ["jobs", params],
    queryFn: async () => {
      const { data } = await jobService.list(params);
      return data;
    },
    placeholderData: (prev) => prev,
  });

export const useJobQuery = (jobId) =>
  useQuery({
    queryKey: ["jobs", jobId],
    queryFn: async () => {
      const { data } = await jobService.show(jobId);
      return data.data;
    },
    enabled: !!jobId,
  });

export const useRankedApplicationsQuery = (jobId, options = {}) =>
  useQuery({
    queryKey: ["jobs", jobId, "ranked"],
    queryFn: async () => {
      const { data } = await jobService.rankedApplications(jobId);
      return data.data ?? [];
    },
    enabled: !!jobId && (options.enabled ?? true),
  });

export const useCreateJobMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: jobService.store,
    onSuccess: (response) => {
      toast.success(response.data.message ?? "Job created");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useUpdateJobMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, payload }) => jobService.update(jobId, payload),
    onSuccess: (response, { jobId }) => {
      toast.success(response.data.message ?? "Job updated");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs", jobId] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useCloseJobMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: jobService.close,
    onSuccess: (response, jobId) => {
      toast.success(response.data.message ?? "Job closed");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs", jobId] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useDeleteJobMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: jobService.destroy,
    onSuccess: (response) => {
      toast.success(response.data.message ?? "Job archived");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useTrashedJobsQuery = (params) =>
  useQuery({
    queryKey: ["jobs", "trashed", params],
    queryFn: async () => {
      const { data } = await jobService.trashed(params);
      return data;
    },
    placeholderData: (prev) => prev,
  });

export const useRestoreJobMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: jobService.restore,
    onSuccess: () => {
      toast.success("Job restored to draft");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};
