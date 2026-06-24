import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import ProjectsScreen from "./ProjectsScreen";
import TasksScreen from "./TasksScreen";
import MeetingsScreen from "./MeetingsScreen";
import { useTheme } from "../theme/ThemeContext";
import NoticesScreen from "./NoticesScreen";
import QAScreen from "./QAScreen";

const TABS = [
  { key: "projects", label: "프로젝트" },
  { key: "tasks", label: "태스크" },
  { key: "meetings", label: "회의" },
  { key: "notices", label: "공지" },
  { key: "qa", label: "QA" },
];

export default function HomeScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState("projects");
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>PMS</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Search")}>
          <Text style={[styles.searchIcon, { color: primary }]}>🔍</Text>
        </TouchableOpacity>
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
        {activeTab === "projects" && <ProjectsScreen navigation={navigation} />}
        {activeTab === "tasks" && <TasksScreen navigation={navigation} />}
        {activeTab === "meetings" && <MeetingsScreen navigation={navigation} />}
        {activeTab === "notices" && <NoticesScreen navigation={navigation} />}
        {activeTab === "qa" && <QAScreen navigation={navigation} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 56,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontWeight: "bold" },
  searchIcon: { fontSize: 20 },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 14, fontWeight: "600" },
});
