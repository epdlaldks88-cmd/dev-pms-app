import { apiClient } from "./client";

export const getQAList = async (srNumber?: string) => {
  const response = await apiClient.get("/qa", {
    params: srNumber ? { srNumber } : {},
  });
  return response.data;
};

export const getQADetail = async (id: string) => {
  const response = await apiClient.get(`/qa/${id}`);
  return response.data;
};

export const acceptQA = async (id: string) => {
  const response = await apiClient.patch(`/qa/${id}/accept`);
  return response.data;
};

export const confirmQA = async (id: string) => {
  const response = await apiClient.patch(`/qa/${id}/confirm`);
  return response.data;
};

export const rejectQA = async (id: string) => {
  const response = await apiClient.patch(`/qa/${id}/reject`);
  return response.data;
};

export const cancelQA = async (id: string) => {
  const response = await apiClient.patch(`/qa/${id}/cancel`);
  return response.data;
};

export const reopenQA = async (id: string) => {
  const response = await apiClient.patch(`/qa/${id}/reopen`);
  return response.data;
};
