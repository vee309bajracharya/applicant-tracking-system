import axiosClient from "../api/axiosClient";

// NOTE: GET /skills is gated behind the "skills.manage" permission, which
// only the admin role currently holds (see permissions.js ROLE_PERMISSIONS).
// HR Managers (jobs.create) and Candidates (profile.manage) have no
// backend-authorized way to browse the master skill taxonomy. This service
// is wired up for when that permission gap is fixed; until then, the skill
// picker will 403 for non-admin users. Flagged in Rules.md-style: not
// silently patched over here.
const skillService = {
  list: (params) => axiosClient.get("/skills", { params }),
  store: (payload) => axiosClient.post("/skills", payload),
  update: (skillId, payload) => axiosClient.patch(`/skills/${skillId}`, payload),
  destroy: (skillId) => axiosClient.delete(`/skills/${skillId}`),
};

export default skillService;
