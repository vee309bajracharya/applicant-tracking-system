import axiosClient from "../api/axiosClient";

const interviewService = {
  listForApplication: (applicationId) => axiosClient.get(`/applications/${applicationId}/interviews`),
  store: (payload) => axiosClient.post("/interviews", payload),
  update: (interviewId, payload) => axiosClient.patch(`/interviews/${interviewId}`, payload),
  cancel: (interviewId) => axiosClient.patch(`/interviews/${interviewId}/cancel`),

  storeFeedback: (interviewId, payload) => axiosClient.post(`/interviews/${interviewId}/feedback`, payload),
  updateFeedback: (feedbackId, payload) => axiosClient.patch(`/interview-feedback/${feedbackId}`, payload),
  destroyFeedback: (feedbackId) => axiosClient.delete(`/interview-feedback/${feedbackId}`),
};

export default interviewService;
