import { apiClient } from "./client";

export const getWorklogs = async (userId?: string) => {
  const response = await apiClient.get("/worklogs", {
    params: userId ? { userId } : {},
  });
  return response.data;
};

export const acknowledgeWorklog = async (id: string) => {
  const response = await apiClient.patch(`/worklogs/${id}/acknowledge`);
  return response.data;
};
