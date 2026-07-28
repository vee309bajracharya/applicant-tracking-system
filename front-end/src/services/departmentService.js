import axiosClient from "../api/axiosClient";

const departmentService = {
  list: (companyId, params) => axiosClient.get(`/companies/${companyId}/departments`, { params }),
  
  store: (payload) => axiosClient.post("/departments", payload),

  update: (departmentId, payload) => axiosClient.patch(`/departments/${departmentId}`, payload),

  destroy: (departmentId) => axiosClient.delete(`/departments/${departmentId}`),
};

export default departmentService;