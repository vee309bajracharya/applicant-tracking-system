import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import candidateProfileService from "../services/candidateProfileService";

const extractErrorMessage = (error) =>
  error?.response?.data?.message || "Something went wrong. Please try again.";

export const useCandidateProfileQuery = () =>
  useQuery({
    queryKey: ["candidate", "profile"],
    queryFn: async () => {
      const { data } = await candidateProfileService.show();
      return data.data;
    },
    retry: false,
  });

export const useSaveCandidateProfileMutation = (isEditMode) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      isEditMode ? candidateProfileService.update(payload) : candidateProfileService.store(payload),
    onSuccess: (response) => {
      toast.success(response.data.message ?? "Profile saved");
      queryClient.invalidateQueries({ queryKey: ["candidate", "profile"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useBrowseCandidatesQuery = (params) =>
  useQuery({
    queryKey: ["candidates", params],
    queryFn: async () => {
      const { data } = await candidateProfileService.browse(params);
      return data;
    },
    placeholderData: (prev) => prev,
  });
