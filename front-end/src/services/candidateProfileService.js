import axiosClient from "../api/axiosClient";

const candidateProfileService = {
  show: () => axiosClient.get("/candidate/profile"),
  store: (payload) => axiosClient.post("/candidate/profile", payload),
  update: (payload) => axiosClient.patch("/candidate/profile", payload),
  browse: (params) => axiosClient.get("/candidates", { params }),
};

export default candidateProfileService;
