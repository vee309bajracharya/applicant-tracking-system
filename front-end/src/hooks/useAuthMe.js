import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import authService from "../services/authService";
import { useAuth } from "../contexts/AuthContext";

export const useAuthMeQuery = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await authService.me();
      return data.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};

const extractErrorMessage = (error) =>
  error?.response?.data?.message || "Something went wrong. Please try again.";

export const useUpdateMeMutation = () => {
  const queryClient = useQueryClient();
  const { updateStoredUser } = useAuth();
  return useMutation({
    mutationFn: authService.updateMe,
    onSuccess: (response) => {
      toast.success(response.data.message ?? "Account updated");
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      // keep the fullname shown in Navbar/SideNav in sync without forcing a logout
      updateStoredUser(response.data.data);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
};
