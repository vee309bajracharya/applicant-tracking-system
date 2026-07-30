import axiosClient from "../api/axiosClient";

const candidateApplicationService = {
  list: (params) => axiosClient.get("/candidate/applications", { params }),
  apply: (payload) => axiosClient.post("/candidate/applications", payload),
};

export default candidateApplicationService;
