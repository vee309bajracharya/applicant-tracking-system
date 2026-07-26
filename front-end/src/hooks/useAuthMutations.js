import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import authService from "../services/authService";
import { useAuth } from "../contexts/AuthContext";

const extractErrorMessage = (error) =>
  error?.response?.data?.message || "Something went wrong. Please try again.";

export const useLoginMutation = () => {
  const { persistSession } = useAuth();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      const { token, user } = response.data.data;
      persistSession(token, user);
      toast.success("Login successful");
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  });
};

export const useRegisterMutation = () =>
  useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      toast.success("Registration successful. Check your email for the OTP.");
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

export const useVerifyEmailMutation = () =>
  useMutation({
    mutationFn: authService.verifyEmail,
    onSuccess: () => toast.success("Email verified. You can log in now."),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

export const useResendOtpMutation = () =>
  useMutation({
    mutationFn: authService.resendVerificationOtp,
    onSuccess: () => toast.success("OTP resent. Check your email."),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

export const useForgotPasswordMutation = () =>
  useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => toast.success("OTP sent. Check your email."),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

export const useVerifyResetOtpMutation = () =>
  useMutation({
    mutationFn: authService.verifyResetOtp,
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

export const useResetPasswordMutation = () =>
  useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => toast.success("Password reset. Please log in."),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

export const useLogoutMutation = () => {
  const { clearSession } = useAuth();
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => toast.success("Logged out successfully"),
    onError: () => toast.error("Logout request failed, but you've been signed out locally."),
    onSettled: () => clearSession(), // clear locally even if the API call fails
  });
};
