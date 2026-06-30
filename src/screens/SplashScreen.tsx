import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { apiClient } from "../api/client";
import {
  tokenStorage,
  userStorage,
  migrateTokensIfNeeded,
} from "../lib/storage";

export default function SplashScreen({ navigation }: any) {
  console.log("[Splash] MOUNTED"); // ⭐ 추가
  const { primary, colors } = useTheme();

  useEffect(() => {
    let mounted = true;
    let navigated = false;

    const safeNavigate = (route: string) => {
      if (navigated || !mounted) return;
      navigated = true;
      navigation.replace(route);
    };

    const checkAuth = async () => {
      try {
        await migrateTokensIfNeeded();
        if (!mounted) return;

        const token = await tokenStorage.getAccessToken();
        if (__DEV__) console.log("[splash] token:", token ? "EXISTS" : "NULL");
        if (!mounted) return;

        if (!token) {
          if (__DEV__) console.log("[splash] going to Login");
          safeNavigate("Login");
          return;
        }

        const userId = await userStorage.getUserId();
        if (userId) {
          await apiClient.get(`/users/${userId}`);
        }
        if (!mounted) return;

        safeNavigate("MainTab");
      } catch (error) {
        if (!mounted) return;
        await tokenStorage.clearTokens();
        await userStorage.clearUserId();
        safeNavigate("Login");
      }
    };

    const timer = setTimeout(checkAuth, 1500);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 로고 */}
      <View style={styles.logoContainer}>
        <View style={[styles.logoBox, { backgroundColor: primary }]}>
          <Text style={styles.logoText}>PMS</Text>
        </View>
        <Text style={[styles.appName, { color: colors.text }]}>
          Project Management
        </Text>
        <Text style={[styles.appSub, { color: colors.textSecondary }]}>
          System
        </Text>
      </View>

      {/* 하단 로딩 */}
      <View style={styles.bottom}>
        <ActivityIndicator size="small" color={primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Loading...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  logoBox: {
    width: 120,
    height: 120,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  logoText: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: -1,
  },
  appName: {
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: 1,
  },
  appSub: {
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: 1,
    marginTop: 2,
  },
  bottom: {
    paddingBottom: 60,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
  },
});
