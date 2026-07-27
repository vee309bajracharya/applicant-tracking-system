import axiosClient from "../api/axiosClient";

const adminUserService = {
  list: (params) => axiosClient.get("/admin/users", { params }),
  show: (userId) => axiosClient.get(`/admin/users/${userId}`),
  invite: (payload) => axiosClient.post("/admin/invite", payload),
  suspend: (userId) => axiosClient.patch(`/admin/users/${userId}/suspend`),
  activate: (userId) => axiosClient.patch(`/admin/users/${userId}/activate`),
  destroy: (userId) => axiosClient.delete(`/admin/users/${userId}`),
};

export default adminUserService;
