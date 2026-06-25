import { apiClient } from "./client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { disconnectSocket } from "../hooks/useSocket";

export const login = async (email: string, password: string) => {
  try {
    const response = await apiClient.post("/auth/login", { email, password });
    const { accessToken, refreshToken, user } = response.data;
    await AsyncStorage.setItem("accessToken", accessToken);
    await AsyncStorage.setItem("refreshToken", refreshToken);
    if (user?.id) {
      await AsyncStorage.setItem("userId", user.id);
    }
    return response.data;
  } catch (error: any) {
    console.log("에러:", JSON.stringify(error?.response?.data));
    throw error;
  }
};

export const logout = async () => {
  disconnectSocket();
  await AsyncStorage.multiRemove(["accessToken", "refreshToken", "userId"]);
};
