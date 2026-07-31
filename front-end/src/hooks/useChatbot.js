import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import chatbotService from "../services/chatbotService";

const extractErrorMessage = (error) =>
  error?.response?.data?.message || "The assistant couldn't respond. Please try again.";

export const useStartConversationMutation = () =>
  useMutation({
    mutationFn: chatbotService.startConversation,
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

export const useSendChatMessageMutation = () =>
  useMutation({
    mutationFn: ({ conversationId, message }) => chatbotService.sendMessage(conversationId, message),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
