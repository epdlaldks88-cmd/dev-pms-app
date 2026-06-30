import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_ID_KEY = "userId";

// === 토큰 (민감) → SecureStore (Android Keystore / iOS Keychain) ===
export const tokenStorage = {
  getAccessToken: () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string) =>
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token),
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) =>
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token),
  clearTokens: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },
};

// === 비민감 정보 → AsyncStorage 유지 ===
export const userStorage = {
  getUserId: () => AsyncStorage.getItem(USER_ID_KEY),
  setUserId: (id: string) => AsyncStorage.setItem(USER_ID_KEY, id),
  clearUserId: () => AsyncStorage.removeItem(USER_ID_KEY),
};

// === 기존 사용자 마이그레이션 (앱 시작 시 1회 호출) ===
export const migrateTokensIfNeeded = async (): Promise<void> => {
  try {
    if (__DEV__) console.log("[migrate] start");
    const [oldAccess, oldRefresh] = await Promise.all([
      AsyncStorage.getItem(ACCESS_TOKEN_KEY),
      AsyncStorage.getItem(REFRESH_TOKEN_KEY),
    ]);

    if (__DEV__)
      console.log(
        "[migrate] oldAccess:",
        !!oldAccess,
        "oldRefresh:",
        !!oldRefresh,
      );

    if (oldAccess) {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, oldAccess);
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      if (__DEV__) console.log("[migrate] access migrated");
    }
    if (oldRefresh) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, oldRefresh);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      if (__DEV__) console.log("[migrate] refresh migrated");
    }
    if (__DEV__) console.log("[migrate] done");
  } catch (e) {
    if (__DEV__) console.log("[migrate] failed", e);
  }
};
