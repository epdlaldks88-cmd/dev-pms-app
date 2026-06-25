import { apiClient } from "./client";

export const getMeetings = async () => {
  const response = await apiClient.get("/meetings");
  return response.data;
};

export const getMeetingDetail = async (meetingId: string) => {
  const response = await apiClient.get(`/meetings/${meetingId}`);
  return response.data;
};

export const createMeeting = async (data: {
  title: string;
  content?: string;
  meetingDate?: string;
  startTime?: string;
  endTime?: string;
  attendees?: string;
  location?: string;
  projectId?: string;
  participantIds?: string[];
}) => {
  const response = await apiClient.post("/meetings", data);
  return response.data;
};

export const updateMeeting = async (
  meetingId: string,
  data: {
    title?: string;
    content?: string;
    meetingDate?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    attendees?: string;
    projectId?: string;
    participantIds?: string[];
  },
) => {
  const response = await apiClient.patch(`/meetings/${meetingId}`, data);
  return response.data;
};
