import axiosClient from "../api/axiosClient";

const dashboardService = {
  get: () => axiosClient.get("/dashboard"),
};

export default dashboardService;
