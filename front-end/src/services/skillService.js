import axiosClient from "../api/axiosClient";

// GET /skills accepts skills.view OR skills.manage as HR now holds the job-form skill picker
// and candidates hold skills.view too for their own skill picker for job
const skillService = {
  list: (params) => axiosClient.get("/skills", { params }),
  store: (payload) => axiosClient.post("/skills", payload),
  update: (skillId, payload) => axiosClient.patch(`/skills/${skillId}`, payload),
  destroy: (skillId) => axiosClient.delete(`/skills/${skillId}`),
};

export default skillService;
