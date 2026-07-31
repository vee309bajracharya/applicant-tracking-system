import axiosClient from "../api/axiosClient";

const chatbotService = {
  listConversations: (params) => axiosClient.get("/chatbot/conversations", { params }),
  showConversation: (conversationId) => axiosClient.get(`/chatbot/conversations/${conversationId}`),
  startConversation: (message) => axiosClient.post("/chatbot/conversations", { message }),
  sendMessage: (conversationId, message) =>
    axiosClient.post(`/chatbot/conversations/${conversationId}/messages`, { message }),
};

export default chatbotService;
