import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { getNotices } from "../api/notices";
import { getProjects } from "../api/projects";
import { useTheme } from "../theme/ThemeContext";
import ErrorView from "../components/ErrorView";
import { useFocusEffect } from "@react-navigation/native";

interface Notice {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  createdBy: { name: string };
  project: { name: string; color: string };
}

export default function NoticesScreen({ navigation, showHeader = true }: any) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { primary, colors } = useTheme();
  const [error, setError] = useState(false);

  const fetchNotices = async () => {
    try {
      setError(false);
      // 모든 프로젝트의 공지사항 가져오기
      const projects = await getProjects();
      const noticePromises = projects.map((project: any) =>
        getNotices(project.id)
          .then((data: any[]) =>
            data.map((n: any) => ({
              ...n,
              project: { name: project.name, color: project.color },
            })),
          )
          .catch(() => []),
      );
      const noticeArrays = await Promise.all(noticePromises);
      const allNotices = noticeArrays.flat().sort((a: any, b: any) => {
        // 고정 공지 먼저, 그 다음 최신순
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
      setNotices(allNotices);
    } catch (error) {
      console.log("공지사항 조회 실패:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotices();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetch = async () => {
        setLoading(true);
        await fetchNotices();
      };
      fetch();
    }, []),
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  if (error) {
    return <ErrorView onRetry={fetchNotices} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showHeader && (
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            공지사항
          </Text>
        </View>
      )}
      {notices.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            공지사항이 없습니다
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          data={notices}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.item,
                { backgroundColor: colors.surface, borderColor: colors.border },
                item.isPinned && {
                  borderLeftWidth: 3,
                  borderLeftColor: primary,
                },
              ]}
              onPress={() =>
                navigation.navigate("NoticeDetail", { notice: item })
              }
            >
              <View style={styles.itemTop}>
                <View style={styles.tags}>
                  {item.isPinned && (
                    <View
                      style={[
                        styles.pinnedBadge,
                        { backgroundColor: primary + "20" },
                      ]}
                    >
                      <Text style={[styles.pinnedText, { color: primary }]}>
                        📌 고정
                      </Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.projectTag,
                      { backgroundColor: item.project?.color + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.projectText,
                        { color: item.project?.color },
                      ]}
                    >
                      {item.project?.name}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.date, { color: colors.textMuted }]}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>
              <Text
                style={[styles.title, { color: colors.text }]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text
                style={[styles.content, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {item.content}
              </Text>
              <Text style={[styles.author, { color: colors.textMuted }]}>
                {item.createdBy?.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    padding: 16,
    paddingTop: 56,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  item: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tags: { flexDirection: "row", gap: 6 },
  pinnedBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  pinnedText: { fontSize: 11, fontWeight: "600" },
  projectTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  projectText: { fontSize: 11, fontWeight: "600" },
  date: { fontSize: 12 },
  title: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  content: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  author: { fontSize: 12 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400,
  },
  emptyText: { fontSize: 16 },
});
