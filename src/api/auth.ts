import { apiClient } from "./client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const login = async (email: string, password: string) => {
  const response = await apiClient.post("/auth/login", { email, password });
  const { accessToken, refreshToken } = response.data;
  await AsyncStorage.setItem("accessToken", accessToken);
  await AsyncStorage.setItem("refreshToken", refreshToken);
  return response.data;
};

export const logout = async () => {
  await AsyncStorage.removeItem("accessToken");
  await AsyncStorage.removeItem("refreshToken");
};
