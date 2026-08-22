import axiosClient from "../api/axiosClient";

// responseType "blob" is required since these stream a binary file, not JSON.
const reportService = {
  hiring: () => axiosClient.get("/reports/hiring", { responseType: "blob" }),
  candidates: () => axiosClient.get("/reports/candidates", { responseType: "blob" }),
  interviews: () => axiosClient.get("/reports/interviews", { responseType: "blob" }),
};

export default reportService;
