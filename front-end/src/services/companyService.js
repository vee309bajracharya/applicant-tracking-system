import axiosClient from "../api/axiosClient";

const toFormData = (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    // Only append logo if a NEW file was selected
    if (key === "logo") {
      if (value instanceof File) {
        formData.append("logo", value);
      }
      return;
    }

    formData.append(key, String(value));
  });
  return formData;
};

const companyService = {
  list: (params) => axiosClient.get("/companies", { params }),
  show: (companyId) => axiosClient.get(`/companies/${companyId}`),

  store: (payload) =>
    axiosClient.post("/companies", toFormData(payload), {
      headers: { "Content-Type": undefined, Accept: "application/json" },
    }),

  update: (companyId, payload) =>
    axiosClient.post(
      `/companies/${companyId}`,
      toFormData({ ...payload, _method: "PATCH" }),
      {
        headers: { "Content-Type": undefined, Accept: "application/json" },
      }
    ),

  destroy: (companyId) => axiosClient.delete(`/companies/${companyId}`),

  assignUser: (companyId, payload) => axiosClient.post(`/companies/${companyId}/users`, payload),
  unassignUser: (companyId, userId) => axiosClient.delete(`/companies/${companyId}/users/${userId}`),
};

export default companyService;