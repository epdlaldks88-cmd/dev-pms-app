import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

interface ErrorViewProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  title = "데이터를 불러오지 못했습니다",
  description = "네트워크 상태를 확인하고 다시 시도해주세요.",
  onRetry,
  retryLabel = "다시 시도",
}) => {
  const { colors, primary } = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons
        name="cloud-offline-outline"
        size={56}
        color={colors.textMuted}
        style={{ marginBottom: 16 }}
      />

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {description}
      </Text>

      {onRetry ? (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: primary }]}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{retryLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
    minHeight: 280,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 140,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
