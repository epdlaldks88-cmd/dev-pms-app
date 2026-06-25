import { apiClient } from "./client";

export const getWbsItems = async (projectId: string) => {
  const response = await apiClient.get(`/projects/${projectId}/wbs`);
  return response.data;
};

export const createWbsItem = async (
  projectId: string,
  data: {
    title: string;
    assignee?: string;
    startDate?: string;
    endDate?: string;
    progress?: number;
    status?: string;
    note?: string;
  },
) => {
  const response = await apiClient.post(`/projects/${projectId}/wbs`, data);
  return response.data;
};

export const updateWbsItem = async (
  projectId: string,
  id: string,
  data: {
    title?: string;
    assignee?: string;
    startDate?: string | null;
    endDate?: string | null;
    progress?: number;
    status?: string;
    note?: string;
  },
) => {
  const response = await apiClient.patch(
    `/projects/${projectId}/wbs/${id}`,
    data,
  );
  return response.data;
};

export const deleteWbsItem = async (projectId: string, id: string) => {
  const response = await apiClient.delete(`/projects/${projectId}/wbs/${id}`);
  return response.data;
};
