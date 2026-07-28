import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import departmentService from "../services/departmentService";

const extractErrorMessage = (error) =>
  error?.response?.data?.message || "Something went wrong. Please try again.";

export const useDepartmentsQuery = (companyId, params) =>
  useQuery({
    queryKey: ["departments", companyId, params],
    queryFn: async () => {
      const { data } = await departmentService.list(companyId, params);
      return data;
    },
    enabled: !!companyId,
    placeholderData: (prev) => prev,
  });

export const useCreateDepartmentMutation = (companyId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: departmentService.store,
    onSuccess: (response) => {
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: ["departments", companyId] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useUpdateDepartmentMutation = (companyId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ departmentId, payload }) => departmentService.update(departmentId, payload),
    onSuccess: (response) => {
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: ["departments", companyId] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useDeleteDepartmentMutation = (companyId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: departmentService.destroy,
    onSuccess: (response) => {
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: ["departments", companyId] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};
