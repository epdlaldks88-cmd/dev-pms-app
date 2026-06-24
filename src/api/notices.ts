import { apiClient } from "./client";

export const getNotices = async (projectId: string) => {
  const response = await apiClient.get(`/projects/${projectId}/notices`);
  return response.data;
};

export const getNoticeDetail = async (projectId: string, noticeId: string) => {
  const response = await apiClient.get(
    `/projects/${projectId}/notices/${noticeId}`,
  );
  return response.data;
};
