import { apiClient } from "./client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const login = async (email: string, password: string) => {
  try {
    const response = await apiClient.post("/auth/login", { email, password });
    const { accessToken, refreshToken, user } = response.data;
    console.log("로그인 응답:", JSON.stringify(response.data));
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
  await AsyncStorage.removeItem("accessToken");
  await AsyncStorage.removeItem("refreshToken");
  await AsyncStorage.removeItem("userId");
};
