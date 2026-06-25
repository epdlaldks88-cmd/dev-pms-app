import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import PagerView from "react-native-pager-view";
import ProjectsScreen from "./ProjectsScreen";
import TasksScreen from "./TasksScreen";
import MeetingsScreen from "./MeetingsScreen";
import NoticesScreen from "./NoticesScreen";
import IssuesScreen from "./IssuesScreen";
import QAScreen from "./QAScreen";
import { useTheme } from "../theme/ThemeContext";
import WorklogsScreen from "./WorklogsScreen";

const TABS = [
  { key: "projects", label: "프로젝트" },
  { key: "tasks", label: "태스크" },
  { key: "meetings", label: "회의" },
  { key: "notices", label: "공지" },
  { key: "issues", label: "이슈" },
  { key: "qa", label: "QA" },
  { key: "worklogs", label: "워크로그" },
];

export default function HomeScreen({ navigation }: any) {
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const tabScrollRef = useRef<ScrollView>(null);
  const { primary, colors } = useTheme();

  const handleTabPress = (index: number) => {
    setActiveIndex(index);
    pagerRef.current?.setPage(index);

    // 선택된 탭이 보이도록 스크롤
    tabScrollRef.current?.scrollTo({
      x: index * 80 - 80,
      animated: true,
    });
  };

  const handlePageSelected = (e: any) => {
    const index = e.nativeEvent.position;
    setActiveIndex(index);
    tabScrollRef.current?.scrollTo({
      x: index * 80 - 80,
      animated: true,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 헤더 */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>PMS</Text>
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          {activeIndex === 1 && ( // 태스크 탭
            <TouchableOpacity onPress={() => navigation.navigate("CreateTask")}>
              <Text style={{ color: primary, fontWeight: "600" }}>+ 생성</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.navigate("Search")}>
            <Text style={[styles.searchIcon, { color: primary }]}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 스크롤 탭 */}
      <View
        style={[
          styles.tabContainer,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <ScrollView
          ref={tabScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {TABS.map((tab, index) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeIndex === index && {
                  borderBottomColor: primary,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => handleTabPress(index)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeIndex === index ? primary : colors.textMuted },
                  activeIndex === index && { fontWeight: "700" },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 스와이프 가능한 페이지 */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        <View key="projects" style={{ flex: 1 }}>
          <ProjectsScreen navigation={navigation} showHeader={false} />
        </View>
        <View key="tasks" style={{ flex: 1 }}>
          <TasksScreen navigation={navigation} showHeader={false} />
        </View>
        <View key="meetings" style={{ flex: 1 }}>
          <MeetingsScreen navigation={navigation} showHeader={false} />
        </View>
        <View key="notices" style={{ flex: 1 }}>
          <NoticesScreen navigation={navigation} showHeader={false} />
        </View>
        <View key="issues" style={{ flex: 1 }}>
          <IssuesScreen navigation={navigation} showHeader={false} />
        </View>
        <View key="qa" style={{ flex: 1 }}>
          <QAScreen navigation={navigation} showHeader={false} />
        </View>
        <View key="worklogs" style={{ flex: 1 }}>
          <WorklogsScreen navigation={navigation} showHeader={false} />
        </View>
      </PagerView>
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
  tabContainer: {
    borderBottomWidth: 1,
  },
  tabScrollContent: {
    paddingHorizontal: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  tabText: { fontSize: 14 },
});
