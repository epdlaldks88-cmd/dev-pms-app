import { apiClient } from "./client";

export const search = async (query: string) => {
  const response = await apiClient.get("/search", { params: { q: query } });
  return response.data;
};
