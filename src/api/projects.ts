import { apiClient } from "./client";

export const getProjects = async () => {
  const response = await apiClient.get("/projects");
  return response.data;
};

export const getProjectDetail = async (projectId: string) => {
  const response = await apiClient.get(`/projects/${projectId}`);
  return response.data;
};

export const getProjectTasks = async (projectId: string) => {
  const response = await apiClient.get(`/projects/${projectId}/tasks`);
  return response.data;
};

export const getProjectMembers = async (projectId: string) => {
  const response = await apiClient.get(`/projects/${projectId}/members`);
  return response.data;
};
