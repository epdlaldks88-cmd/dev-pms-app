import { apiClient } from "./client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getMyProfile = async () => {
  const userId = await AsyncStorage.getItem("userId");
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
