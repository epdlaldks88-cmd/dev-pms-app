import { apiClient } from "./client";
import { userStorage } from "../lib/storage";

export const getMyProfile = async () => {
  const userId = await userStorage.getUserId();
  if (!userId) throw new Error("userId 없음");
  const response = await apiClient.get(`/users/${userId}`);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await apiClient.get("/users");
  return response.data;
};

export const updateProfile = async (data: {
  name?: string;
  position?: string;
  department?: string;
  phone?: string;
}) => {
  const response = await apiClient.patch("/users/profile", data);
  return response.data;
};
