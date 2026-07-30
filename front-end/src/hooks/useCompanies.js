import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import companyService from "../services/companyService";

const extractErrorMessage = (error) =>
  error?.response?.data?.message || "Something went wrong. Please try again.";

export const useCompaniesQuery = (params, options = {}) =>
  useQuery({
    queryKey: ["companies", params],
    queryFn: async () => {
      const { data } = await companyService.list(params);
      return data;
    },
    placeholderData: (prev) => prev,
    ...options,
  });

export const useCompanyQuery = (companyId) =>
  useQuery({
    queryKey: ["companies", companyId],
    queryFn: async () => {
      const { data } = await companyService.show(companyId);
      return data.data;
    },
    enabled: !!companyId,
  });

export const useCreateCompanyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: companyService.store,
    onSuccess: (response) => {
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useUpdateCompanyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, payload }) => companyService.update(companyId, payload),
    onSuccess: (response) => {
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useDeleteCompanyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: companyService.destroy,
    onSuccess: (response) => {
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useAssignCompanyUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, payload }) => companyService.assignUser(companyId, payload),
    onSuccess: (response, { companyId }) => {
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: ["companies", companyId] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useUnassignCompanyUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, userId }) => companyService.unassignUser(companyId, userId),
    onSuccess: (response, { companyId }) => {
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: ["companies", companyId] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};
