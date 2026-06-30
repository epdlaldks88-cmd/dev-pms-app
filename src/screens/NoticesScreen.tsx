import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { useFocusEffect } from "@react-navigation/native";
import { formatDate } from "../utils/date";
import Header from "../components/Header";
import { getAllNotices } from "../api/notices";
import { EmptyState } from "../components/EmptyState";
import { ErrorView } from "../components/ErrorView";
import { SkeletonList } from "../components/SkeletonItem";

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

  const fetchNotices = async (showLoading: boolean = true) => {
    try {
      setError(false);
      if (showLoading) setLoading(true);
      const data = await getAllNotices();
      // 고정 공지 먼저, 최신순 정렬
      const sorted = data.sort((a: any, b: any) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
      setNotices(sorted);
    } catch (error) {
      if (__DEV__) console.log("[NoticesScreen] fetch failed");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotices(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotices(notices.length === 0); // items는 각 화면의 데이터 state명
    }, [notices.length]),
  );

  if (loading) {
    return (
      <View style={[{ flex: 1 }, { backgroundColor: colors.background }]}>
        {showHeader && <Header title="공지사항" />}
        <SkeletonList count={5} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {showHeader && <Header title="공지사항" />}
        <ErrorView onRetry={() => fetchNotices()} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showHeader && <Header title="공지사항" />}

      <FlatList
        data={notices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          notices.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          <EmptyState
            icon="megaphone-outline"
            title="공지사항이 없습니다"
            description="등록된 공지사항이 없어요"
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
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
                    style={[styles.projectText, { color: item.project?.color }]}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  emptyContainer: { flexGrow: 1 }, // flex: 1 → flexGrow: 1
  list: { padding: 16 },
});
