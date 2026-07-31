import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import faqService from "../services/faqService";

const extractErrorMessage = (error) =>
  error?.response?.data?.message || "Something went wrong. Please try again.";

export const useFaqsQuery = (params, options = {}) =>
  useQuery({
    queryKey: ["faqs", params],
    queryFn: async () => {
      const { data } = await faqService.list(params);
      return data;
    },
    placeholderData: (prev) => prev,
    ...options,
  });

export const useCreateFaqMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: faqService.store,
    onSuccess: (response) => {
      toast.success(response.data.message ?? "FAQ created");
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useUpdateFaqMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ faqId, payload }) => faqService.update(faqId, payload),
    onSuccess: (response) => {
      toast.success(response.data.message ?? "FAQ updated");
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useDeleteFaqMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: faqService.destroy,
    onSuccess: (response) => {
      toast.success(response.data.message ?? "FAQ deleted");
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};
