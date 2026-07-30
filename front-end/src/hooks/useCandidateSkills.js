import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import candidateSkillService from "../services/candidateSkillService";

const extractErrorMessage = (error) =>
  error?.response?.data?.message || "Something went wrong. Please try again.";

export const useCandidateSkillsQuery = (params) =>
  useQuery({
    queryKey: ["candidate", "skills", params],
    queryFn: async () => {
      const { data } = await candidateSkillService.list(params);
      return data;
    },
    placeholderData: (prev) => prev,
  });

export const useAttachSkillMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: candidateSkillService.store,
    onSuccess: (response) => {
      toast.success(response.data.message ?? "Skill attached");
      queryClient.invalidateQueries({ queryKey: ["candidate", "skills"] });
      queryClient.invalidateQueries({ queryKey: ["candidate", "profile"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useUpdateSkillMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, payload }) => candidateSkillService.update(skillId, payload),
    onSuccess: (response) => {
      toast.success(response.data.message ?? "Proficiency updated");
      queryClient.invalidateQueries({ queryKey: ["candidate", "skills"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useDetachSkillMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: candidateSkillService.destroy,
    onSuccess: (response) => {
      toast.success(response.data.message ?? "Skill removed");
      queryClient.invalidateQueries({ queryKey: ["candidate", "skills"] });
      queryClient.invalidateQueries({ queryKey: ["candidate", "profile"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};
