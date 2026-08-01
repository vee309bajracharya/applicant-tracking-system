import axiosClient from "../api/axiosClient";

const authService = {
  register: (payload) => axiosClient.post("/auth/register", payload),
  login: (payload) => axiosClient.post("/auth/login", payload),
  logout: () => axiosClient.post("/auth/logout"),
  me: () => axiosClient.get("/auth/me"),

  updateMe: (payload) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") formData.append(key, value);
    });
    formData.append("_method", "PATCH");
    return axiosClient.post("/auth/me", formData, {
      headers: { "Content-Type": undefined, Accept: "application/json" },
    });
  },

  verifyEmail: (payload) => axiosClient.post("/auth/verify-email", payload),
  resendVerificationOtp: (payload) => axiosClient.post("/auth/resend-verification-otp", payload),

  forgotPassword: (payload) => axiosClient.post("/auth/password/forgot", payload),
  verifyResetOtp: (payload) => axiosClient.post("/auth/password/verify", payload),
  resetPassword: (payload) => axiosClient.post("/auth/password/reset", payload),

  oauthRedirect: (provider) => axiosClient.post(`/auth/oauth/${provider}/redirect`),
  oauthCallback: (provider, payload) => axiosClient.post(`/auth/oauth/${provider}/callback`, payload),

  setPassword: (payload) => axiosClient.post("/auth/set-password", payload),
};

export default authService;
