import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import authService from "../services/authService";
import { useAuth } from "../contexts/AuthContext";

export const useCurrentUserQuery = () => {
  const { token, setUser, clearSession } = useAuth();

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await authService.me();
      return data.data;
    },
    enabled: !!token,
    staleTime: 60_000,
    retry: false,
  });

  useEffect(() => {
    if (query.data) {
      setUser((prev) => ({ ...prev, ...query.data }));
    }
  }, [query.data, setUser]);

  useEffect(() => {
    if (query.isError) clearSession();
  }, [query.isError, clearSession]);

  return query;
};
