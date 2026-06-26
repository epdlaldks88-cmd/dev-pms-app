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

export const createIssue = async (
  projectId: string,
  data: {
    title: string;
    description?: string;
    riskLevel?: string;
    status?: string;
    assigneeId?: string;
  },
) => {
  const response = await apiClient.post(`/projects/${projectId}/issues`, data);
  return response.data;
};

export const getAllIssues = async () => {
  const response = await apiClient.get("/issues");
  return response.data;
};

export const deleteIssue = async (projectId: string, issueId: string) => {
  const response = await apiClient.delete(
    `/projects/${projectId}/issues/${issueId}`,
  );
  return response.data;
};
