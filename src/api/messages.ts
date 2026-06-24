import { apiClient } from "./client";

export const getConversations = async () => {
  const response = await apiClient.get("/messages/conversations");
  return response.data;
};

export const getThread = async (userId: string) => {
  const response = await apiClient.get(`/messages/thread/${userId}`);
  return response.data;
};

export const sendMessage = async (recipientId: string, content: string) => {
  const response = await apiClient.post("/messages", { recipientId, content });
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await apiClient.get("/messages/unread-count");
  return response.data;
};
