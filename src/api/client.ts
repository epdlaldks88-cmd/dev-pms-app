import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://dev-pms-backend-production.up.railway.app/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// 네비게이션 참조 (외부에서 설정)
let navigationRef: any = null;
export const setNavigationRef = (ref: any) => {
  navigationRef = ref;
};

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("리프레시 토큰 없음");

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        await AsyncStorage.setItem("accessToken", accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 리프레시 토큰도 만료 → 로그아웃
        await AsyncStorage.multiRemove([
          "accessToken",
          "refreshToken",
          "userId",
        ]);

        // 로그인 화면으로 이동
        if (navigationRef) {
          navigationRef.navigate("Login");
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
