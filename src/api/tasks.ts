import { apiClient } from "./client";

export const getMyTasks = async () => {
  const response = await apiClient.get("/tasks/my");
  return response.data;
};
