import axiosClient from "../api/axiosClient";

const applicationService = {
  list: (params) => axiosClient.get("/applications", { params }),
  show: (applicationId) => axiosClient.get(`/applications/${applicationId}`),
  updateStatus: (applicationId, payload) =>
    axiosClient.patch(`/applications/${applicationId}/status`, payload),
  recomputeMatchScore: (applicationId) =>
    axiosClient.patch(`/applications/${applicationId}/match-score`),
  skillGap: (applicationId) => axiosClient.get(`/applications/${applicationId}/skill-gap`),
};

export default applicationService;
