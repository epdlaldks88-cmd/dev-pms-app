import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MessagesScreen from "./MessagesScreen";
import RoomsScreen from "./RoomsScreen";
import { useTheme } from "../theme/ThemeContext";

const TABS = [
  { key: "messages", label: "쪽지" },
  { key: "rooms", label: "채팅방" },
];

export default function ChatScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState("messages");
  const { primary, colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 상단 헤더 */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>메시지</Text>
      </View>

      {/* 탭 */}
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
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab.key ? primary : colors.textMuted },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 콘텐츠 */}
      <View style={{ flex: 1 }}>
        {activeTab === "messages" && <MessagesScreen navigation={navigation} />}
        {activeTab === "rooms" && <RoomsScreen navigation={navigation} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 16,
    paddingTop: 56,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontWeight: "bold" },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 14, fontWeight: "600" },
});
