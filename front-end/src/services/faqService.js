import axiosClient from "../api/axiosClient";

const faqService = {
  list: (params) => axiosClient.get("/faqs", { params }),
  store: (payload) => axiosClient.post("/faqs", payload),
  update: (faqId, payload) => axiosClient.patch(`/faqs/${faqId}`, payload),
  destroy: (faqId) => axiosClient.delete(`/faqs/${faqId}`),
};

export default faqService;
