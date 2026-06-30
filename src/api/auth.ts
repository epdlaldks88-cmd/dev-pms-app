import { apiClient } from "./client";
import { tokenStorage, userStorage } from "../lib/storage";
import { disconnectSocket } from "../hooks/useSocket";
import { removeDeviceToken } from "./deviceToken";

export const login = async (email: string, password: string) => {
  try {
    const response = await apiClient.post("/auth/login", { email, password });
    const { accessToken, refreshToken, user } = response.data;

    await tokenStorage.setAccessToken(accessToken);
    await tokenStorage.setRefreshToken(refreshToken);
    if (user?.id) {
      await userStorage.setUserId(user.id);
    }
    return response.data;
  } catch (error: any) {
    if (__DEV__) {
      console.log("[login] failed status:", error?.response?.status);
    }
    throw error;
  }
};

export const logout = async (fcmToken?: string) => {
  // 1) FCM 토큰 등록 해제 (있으면, 서버 호출 가능한 동안)
  if (fcmToken) {
    try {
      await removeDeviceToken(fcmToken);
    } catch (e) {
      if (__DEV__) console.log("[logout] FCM remove failed");
    }
  }

  // 2) 서버에 로그아웃 (refreshToken 무효화)
  //    실패하더라도 로컬은 무조건 정리
  try {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (refreshToken) {
      await apiClient.post("/auth/logout", { refreshToken });
    }
  } catch (e) {
    if (__DEV__) console.log("[logout] server call failed");
  }

  // 3) 소켓 끊고
  disconnectSocket();

  // 4) 로컬 정리
  await tokenStorage.clearTokens();
  await userStorage.clearUserId();
};
