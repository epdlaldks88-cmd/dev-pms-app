import { apiClient } from "./client";

export const getAllNotices = async () => {
  const response = await apiClient.get("/notices");
  return response.data;
};

export const getNotices = async (projectId: string) => {
  const response = await apiClient.get("/notices", { params: { projectId } });
  return response.data;
};
