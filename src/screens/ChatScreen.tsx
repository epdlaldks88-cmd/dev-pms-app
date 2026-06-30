import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MessagesScreen from "./MessagesScreen";
import RoomsScreen from "./RoomsScreen";
import { useTheme } from "../theme/ThemeContext";
import { useBadge } from "../hooks/useBadge";
import Header from "../components/Header";

const TABS = [
  { key: "messages", label: "쪽지" },
  { key: "rooms", label: "채팅방" },
];

export default function ChatScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState("messages");
  const { primary, colors } = useTheme();
  const { messageCount } = useBadge();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="메시지" />

      <View
        style={[
          styles.tabRow,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && {
                borderBottomColor: primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <View style={styles.tabContent}>
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab.key ? primary : colors.textMuted },
                ]}
              >
                {tab.label}
              </Text>
              {tab.key === "messages" && messageCount > 0 && (
                <View style={[styles.badge, { backgroundColor: primary }]}>
                  <Text style={styles.badgeText}>
                    {messageCount > 99 ? "99+" : messageCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* 두 화면 다 마운트 → display로 전환 (스크롤/데이터 유지) */}
      <View style={{ flex: 1 }}>
        <View
          style={[
            styles.tabPanel,
            { display: activeTab === "messages" ? "flex" : "none" },
          ]}
        >
          <MessagesScreen navigation={navigation} showHeader={false} />
        </View>
        <View
          style={[
            styles.tabPanel,
            { display: activeTab === "rooms" ? "flex" : "none" },
          ]}
        >
          <RoomsScreen navigation={navigation} showHeader={false} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabContent: { flexDirection: "row", alignItems: "center", gap: 6 },
  tabText: { fontSize: 14, fontWeight: "600" },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  tabPanel: { flex: 1 },
});
