import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext";

interface HeaderProps {
  title: string;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
  onBack?: () => void;
}

export default function Header({
  title,
  rightElement,
  leftElement,
  onBack,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors, primary } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 12,
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.left}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={[styles.backText, { color: primary }]}>← 뒤로</Text>
          </TouchableOpacity>
        )}
        {leftElement}
      </View>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>{rightElement}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  left: { width: 80 },
  right: { width: 80, alignItems: "flex-end" },
  title: { fontSize: 17, fontWeight: "600", flex: 1, textAlign: "center" },
  backButton: {},
  backText: { fontSize: 16 },
});
