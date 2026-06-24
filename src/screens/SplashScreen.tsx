import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../theme/ThemeContext";
import { apiClient } from "../api/client";

export default function SplashScreen({ navigation }: any) {
  const { primary, colors } = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) {
          navigation.replace("Login");
          return;
        }

        const userId = await AsyncStorage.getItem("userId");
        if (userId) {
          await apiClient.get(`/users/${userId}`);
        }

        navigation.replace("MainTab");
      } catch (error) {
        await AsyncStorage.multiRemove([
          "accessToken",
          "refreshToken",
          "userId",
        ]);
        navigation.replace("Login");
      }
    };

    // 최소 1.5초 스플래시 보여주기
    const timer = setTimeout(checkAuth, 1500);
    return () => clearTimeout(timer);
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
    color: "#fff",
    letterSpacing: 1,
  },
  appSub: {
    fontSize: 22,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 1,
    marginTop: 2,
  },
  bottom: {
    paddingBottom: 60,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
});
