import { apiClient } from "./client";

export const getMeetings = async () => {
  const response = await apiClient.get("/meetings");
  return response.data;
};

export const getMeetingDetail = async (meetingId: string) => {
  const response = await apiClient.get(`/meetings/${meetingId}`);
  return response.data;
};
