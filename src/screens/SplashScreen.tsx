import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
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

        // 토큰 유효성 검사
        await apiClient.get("/users/me").catch(async () => {
          // me 엔드포인트 없으면 projects로 확인
          const userId = await AsyncStorage.getItem("userId");
          if (userId) {
            await apiClient.get(`/users/${userId}`);
          }
        });

        navigation.replace("MainTab");
      } catch (error) {
        // 토큰 만료 또는 오류 시 로그인으로
        await AsyncStorage.multiRemove([
          "accessToken",
          "refreshToken",
          "userId",
        ]);
        navigation.replace("Login");
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
