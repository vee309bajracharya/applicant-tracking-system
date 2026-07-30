import axiosClient from "../api/axiosClient";

const jobService = {
  list: (params) => axiosClient.get("/jobs", { params }),
  show: (jobId) => axiosClient.get(`/jobs/${jobId}`),
  store: (payload) => axiosClient.post("/jobs", payload),
  update: (jobId, payload) => axiosClient.patch(`/jobs/${jobId}`, payload),
  close: (jobId) => axiosClient.patch(`/jobs/${jobId}/close`),
  destroy: (jobId) => axiosClient.delete(`/jobs/${jobId}`),
  rankedApplications: (jobId) => axiosClient.get(`/jobs/${jobId}/applications/ranked`),
  trashed: (params) => axiosClient.get("/jobs/trashed", { params }),
  restore: (jobId) => axiosClient.patch(`/jobs/${jobId}/restore`),
};

export default jobService;
