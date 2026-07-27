import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor — attach Bearer token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ats_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 / expired token
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("ats_token");
      localStorage.removeItem("ats_user");

      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
