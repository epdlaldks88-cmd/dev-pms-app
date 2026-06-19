import { apiClient } from "./client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_URL = "http://10.15.229.209:3000/api";

export const login = async (email: string, password: string) => {
  console.log("로그인 시도:", email, API_URL);
  try {
    const response = await apiClient.post("/auth/login", { email, password });
    const { accessToken, refreshToken } = response.data;
    await AsyncStorage.setItem("accessToken", accessToken);
    await AsyncStorage.setItem("refreshToken", refreshToken);
    return response.data;
  } catch (error: any) {
    console.log("에러:", JSON.stringify(error?.response?.data));
    throw error;
  }
};
