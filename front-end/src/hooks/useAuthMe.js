import { useQuery } from "@tanstack/react-query";
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
