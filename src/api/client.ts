import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { tokenStorage } from "../lib/storage";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  "https://dev-pms-backend-production.up.railway.app/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// 네비게이션 참조
let navigationRef: any = null;
export const setNavigationRef = (ref: any) => {
  navigationRef = ref;
};

// (선택) AuthContext에서 강제 로그아웃 시 호출할 콜백
let onAuthFailureCallback: (() => void | Promise<void>) | null = null;
export const setOnAuthFailure = (cb: () => void | Promise<void>) => {
  onAuthFailureCallback = cb;
};

// === Request: 토큰 자동 주입 ===
apiClient.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// === 401 동시성 큐 ===
let isRefreshing = false;
let waitQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const flushQueue = (err: any, token: string | null) => {
  waitQueue.forEach((p) => {
    if (err) p.reject(err);
    else if (token) p.resolve(token);
  });
  waitQueue = [];
};

const performRefresh = async (): Promise<string | null> => {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) return null;
  try {
    // 인터셉터 안 타게 raw axios로
    const res = await axios.post(
      `${API_URL}/auth/refresh`,
      { refreshToken },
      { timeout: 10000 },
    );
    const { accessToken, refreshToken: newRefresh } = res.data;
    await tokenStorage.setAccessToken(accessToken);
    // 백엔드가 refresh rotation 한다면 새 refreshToken도 저장
    if (newRefresh) await tokenStorage.setRefreshToken(newRefresh);
    return accessToken;
  } catch {
    return null;
  }
};

const forceLogout = async () => {
  await tokenStorage.clearTokens();
  if (onAuthFailureCallback) {
    try {
      await onAuthFailureCallback();
    } catch {}
  }
  if (navigationRef) {
    navigationRef.reset({ index: 0, routes: [{ name: "Login" }] });
  }
};

// === Response: 401 시 refresh + 큐잉 ===
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;
    if (!originalRequest) return Promise.reject(error);

    const url = originalRequest.url ?? "";
    const isAuthRequest =
      url.includes("/auth/login") || url.includes("/auth/refresh");

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // 이미 refresh 중이면 큐에서 대기
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        waitQueue.push({
          resolve: (token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const newToken = await performRefresh();
      if (!newToken) {
        flushQueue(error, null);
        await forceLogout();
        return Promise.reject(error);
      }
      flushQueue(null, newToken);
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }
      return apiClient(originalRequest);
    } catch (e) {
      flushQueue(e, null);
      await forceLogout();
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  },
);
