import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeContext";

interface SkeletonItemProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonItem({
  width = "100%",
  height = 16,
  borderRadius = 4,
  style,
}: SkeletonItemProps) {
  const { isDark } = useTheme();
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const opacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, opacity },
        { backgroundColor: isDark ? "#4b5563" : "#e2e8f0" },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.cardTop}>
        <SkeletonItem width={80} height={14} />
        <SkeletonItem width={60} height={14} />
      </View>
      <SkeletonItem width="90%" height={18} style={{ marginBottom: 8 }} />
      <SkeletonItem width="60%" height={14} style={{ marginBottom: 12 }} />
      <View style={styles.cardBottom}>
        <SkeletonItem width={50} height={12} />
        <SkeletonItem width={50} height={12} />
      </View>
    </View>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardBottom: {
    flexDirection: "row",
    gap: 8,
  },
  list: { padding: 16 },
});
