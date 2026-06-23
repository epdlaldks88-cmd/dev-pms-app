import { apiClient } from "./client";

export const getMeetings = async () => {
  const response = await apiClient.get("/meetings");
  return response.data;
};
