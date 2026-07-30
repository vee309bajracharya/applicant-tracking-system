import axiosClient from "../api/axiosClient";

const resumeService = {
  list: (params) => axiosClient.get("/candidate/resumes", { params }),

  store: (payload) => {
    const formData = new FormData();
    formData.append("resume", payload.resume);
    if (payload.is_primary) formData.append("is_primary", "1");
    return axiosClient.post("/candidate/resumes", formData, {
      headers: { "Content-Type": undefined, Accept: "application/json" },
    });
  },
  destroy: (resumeId) => axiosClient.delete(`/candidate/resumes/${resumeId}`),
  download: (resumeId) =>
    axiosClient.get(`/resumes/${resumeId}/download`, { responseType: "blob" }),
};

export default resumeService;
