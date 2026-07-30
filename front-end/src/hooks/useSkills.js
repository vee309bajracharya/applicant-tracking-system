import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import skillService from "../services/skillService";

const extractErrorMessage = (error) =>
  error?.response?.data?.message || "Something went wrong. Please try again.";

export const useSkillsQuery = (params, options = {}) =>
  useQuery({
    queryKey: ["skills", params],
    queryFn: async () => {
      const { data } = await skillService.list(params);
      return data;
    },
    placeholderData: (prev) => prev,
    ...options,
  });

export const useCreateSkillMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: skillService.store,
    onSuccess: (response) => {
      toast.success(response.data.message ?? "Skill created");
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useUpdateSkillTaxonomyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, payload }) => skillService.update(skillId, payload),
    onSuccess: (response) => {
      toast.success(response.data.message ?? "Skill updated");
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useDeleteSkillMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: skillService.destroy,
    onSuccess: (response) => {
      toast.success(response.data.message ?? "Skill deleted");
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};
