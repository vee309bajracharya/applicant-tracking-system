import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import interviewService from "../services/interviewService";

const extractErrorMessage = (error) =>
  error?.response?.data?.message || "Something went wrong. Please try again.";

export const useApplicationInterviewsQuery = (applicationId, enabled = true) =>
  useQuery({
    queryKey: ["applications", applicationId, "interviews"],
    queryFn: async () => {
      const { data } = await interviewService.listForApplication(applicationId);
      return data.data ?? [];
    },
    enabled: !!applicationId && enabled,
  });

const invalidateApplicationInterviews = (queryClient, applicationId) => {
  if (applicationId) queryClient.invalidateQueries({ queryKey: ["applications", applicationId, "interviews"] });
};

export const useScheduleInterviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: interviewService.store,
    onSuccess: (response, variables) => {
      toast.success("Interview scheduled");
      invalidateApplicationInterviews(queryClient, variables.application_id);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useUpdateInterviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ interviewId, payload }) => interviewService.update(interviewId, payload),
    onSuccess: (response, { applicationId }) => {
      toast.success("Interview updated");
      invalidateApplicationInterviews(queryClient, applicationId);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useCancelInterviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ interviewId }) => interviewService.cancel(interviewId),
    onSuccess: (response, { applicationId }) => {
      toast.success("Interview cancelled");
      invalidateApplicationInterviews(queryClient, applicationId);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useStoreFeedbackMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ interviewId, payload }) => interviewService.storeFeedback(interviewId, payload),
    onSuccess: (response, { applicationId }) => {
      toast.success("Feedback saved");
      invalidateApplicationInterviews(queryClient, applicationId);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useUpdateFeedbackMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ feedbackId, payload }) => interviewService.updateFeedback(feedbackId, payload),
    onSuccess: (response, { applicationId }) => {
      toast.success("Feedback updated");
      invalidateApplicationInterviews(queryClient, applicationId);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useDeleteFeedbackMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ feedbackId }) => interviewService.destroyFeedback(feedbackId),
    onSuccess: (response, { applicationId }) => {
      toast.success("Feedback removed");
      invalidateApplicationInterviews(queryClient, applicationId);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};
