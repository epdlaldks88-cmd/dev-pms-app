import { apiClient } from "./client";

export const getIssues = async (projectId: string) => {
  const response = await apiClient.get(`/projects/${projectId}/issues`);
  return response.data;
};

export const updateIssue = async (
  projectId: string,
  issueId: string,
  data: any,
) => {
  const response = await apiClient.patch(
    `/projects/${projectId}/issues/${issueId}`,
    data,
  );
  return response.data;
};
