import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeContext";

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorView({
  message = "데이터를 불러오지 못했습니다",
  onRetry,
}: ErrorViewProps) {
  const { primary, colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: primary }]}
          onPress={onRetry}
        >
          <Text style={styles.buttonText}>다시 시도</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  icon: { fontSize: 48, marginBottom: 16 },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  button: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
