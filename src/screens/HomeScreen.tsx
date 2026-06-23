import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { logout } from "../api/auth";
import { usePushNotification } from "../hooks/usePushNotification";

export default function HomeScreen({ navigation }: any) {
  usePushNotification();

  const handleLogout = async () => {
    await logout();
    navigation.replace("MainTab");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PMS 홈</Text>
      <Text style={styles.subtitle}>프로젝트 관리 시스템 앱</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6366f1",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#ef4444",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
