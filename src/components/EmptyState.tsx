import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../theme/ThemeContext";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = "📭",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { primary, colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {description && (
        <Text style={[styles.description, { color: colors.textMuted }]}>
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: primary }]}
          onPress={onAction}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
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
    padding: 32,
    minHeight: 300,
  },
  icon: { fontSize: 56, marginBottom: 16 },
  title: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  button: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
