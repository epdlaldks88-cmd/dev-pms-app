import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeContext";

interface LoadingViewProps {
  message?: string;
  /** false면 전체 화면 대신 inline (작은 크기) */
  fullScreen?: boolean;
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  message,
  fullScreen = true,
}) => {
  const { colors, primary } = useTheme();

  return (
    <View
      style={[
        fullScreen ? styles.fullScreen : styles.inline,
        fullScreen && { backgroundColor: colors.background },
      ]}
    >
      <ActivityIndicator
        size={fullScreen ? "large" : "small"}
        color={primary}
      />
      {message ? (
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  inline: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    marginTop: 12,
    fontSize: 13,
  },
});
