import { apiClient } from "./client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getMyProfile = async () => {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) throw new Error("userId 없음");
  const response = await apiClient.get(`/users/${userId}`);
  return response.data;
};
