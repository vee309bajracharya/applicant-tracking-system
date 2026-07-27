import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import adminUserService from "../services/adminUserService";

const extractErrorMessage = (error) =>
  error?.response?.data?.message || "Something went wrong. Please try again.";

export const useAdminUsersQuery = (params) =>
  useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const { data } = await adminUserService.list(params);
      return data;
    },
    placeholderData: (prev) => prev,
  });

export const useAdminUserQuery = (userId) =>
  useQuery({
    queryKey: ["admin", "users", userId],
    queryFn: async () => {
      const { data } = await adminUserService.show(userId);
      return data.data;
    },
    enabled: !!userId,
  });

export const useInviteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminUserService.invite,
    onSuccess: (response) => {
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useSuspendUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminUserService.suspend,
    onSuccess: (response) => {
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useActivateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminUserService.activate,
    onSuccess: (response) => {
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminUserService.destroy,
    onSuccess: (response) => {
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};
