import axiosClient from "../api/axiosClient";

const candidateSkillService = {
  list: (params) => axiosClient.get("/candidate/skills", { params }),
  store: (payload) => axiosClient.post("/candidate/skills", payload),
  update: (skillId, payload) => axiosClient.patch(`/candidate/skills/${skillId}`, payload),
  destroy: (skillId) => axiosClient.delete(`/candidate/skills/${skillId}`),
};

export default candidateSkillService;
