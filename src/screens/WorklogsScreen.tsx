import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import { getWorklogs, acknowledgeWorklog } from "../api/worklogs";
import { useTheme } from "../theme/ThemeContext";
import { useFocusEffect } from "@react-navigation/native";
import { formatDate } from "../utils/date";
import Header from "../components/Header";
import { EmptyState } from "../components/EmptyState";
import { ErrorView } from "../components/ErrorView";
import { SkeletonList } from "../components/SkeletonItem";
import { userStorage } from "../lib/storage";

interface Worklog {
  id: string;
  srNumber?: string;
  taskTitle?: string;
  projectName?: string;
  description?: string;
  hours: number;
  stage: string;
  workDate: string;
  isAcknowledged: boolean;
  startDate?: string;
  endDate?: string;
}

export default function WorklogsScreen({ navigation, showHeader = true }: any) {
  const [worklogs, setWorklogs] = useState<Worklog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const { primary, colors } = useTheme();

  const fetchWorklogs = async (showLoading: boolean = true) => {
    try {
      setError(false);
      if (showLoading) setLoading(true);
      const userId = await userStorage.getUserId();
      const data = await getWorklogs(userId || undefined);
      setWorklogs(Array.isArray(data) ? data : data.worklogs || []);
    } catch (e) {
      if (__DEV__) console.log("[WorklogsScreen] fetch failed");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWorklogs(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchWorklogs(worklogs.length === 0); // items는 각 화면의 데이터 state명
    }, [worklogs.length]),
  );

  const handleAcknowledge = async (id: string) => {
    Alert.alert("확인", "이 워크로그를 확인 처리하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "확인",
        onPress: async () => {
          try {
            await acknowledgeWorklog(id);
            await fetchWorklogs(false);
          } catch (e) {
            Alert.alert("오류", "처리에 실패했습니다");
          }
        },
      },
    ]);
  };

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      RECEIVED: "접수",
      DEVELOPMENT: "개발중",
      COMPLETED: "개발완료",
      USER_CONFIRMED: "사용자확인",
      DEPLOYED: "배포완료",
    };
    return labels[stage] || stage;
  };

  const getStageColor = (stage: string) => {
    const c: Record<string, string> = {
      RECEIVED: "#94a3b8",
      DEVELOPMENT: primary,
      COMPLETED: "#22c55e",
      USER_CONFIRMED: "#6366f1",
      DEPLOYED: "#f59e0b",
    };
    return c[stage] || "#94a3b8";
  };

  if (loading) {
    return (
      <View style={[{ flex: 1 }, { backgroundColor: colors.background }]}>
        {showHeader && <Header title="워크로그" />}
        <SkeletonList count={5} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {showHeader && <Header title="워크로그" />}
        <ErrorView onRetry={() => fetchWorklogs()} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showHeader && (
        <Header
          title="워크로그"
          rightElement={
            <Text style={[styles.headerCount, { color: colors.textMuted }]}>
              {worklogs.length}건
            </Text>
          } // 기존 우측 버튼이 있으면 유지
        />
      )}

      <FlatList
        data={worklogs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          worklogs.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          <EmptyState
            icon="book-outline"
            title="워크로그가 없습니다"
            description="등록된 워크로그가 없어요"
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
          <View
            style={[
              styles.item,
              { backgroundColor: colors.surface, borderColor: colors.border },
              !item.isAcknowledged && {
                borderLeftWidth: 3,
                borderLeftColor: primary,
              },
            ]}
          >
            <View style={styles.itemTop}>
              <View style={styles.leftInfo}>
                {item.srNumber && (
                  <Text style={[styles.srNumber, { color: primary }]}>
                    {item.srNumber}
                  </Text>
                )}
                <View
                  style={[
                    styles.stageBadge,
                    { backgroundColor: getStageColor(item.stage) + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.stageText,
                      { color: getStageColor(item.stage) },
                    ]}
                  >
                    {getStageLabel(item.stage)}
                  </Text>
                </View>
              </View>
              <Text style={[styles.hours, { color: colors.textMuted }]}>
                {item.hours}h
              </Text>
            </View>

            {item.taskTitle && (
              <Text style={[styles.taskTitle, { color: colors.text }]}>
                {item.taskTitle}
              </Text>
            )}
            {item.projectName && (
              <Text
                style={[styles.projectName, { color: colors.textSecondary }]}
              >
                {item.projectName}
              </Text>
            )}
            {item.description && (
              <Text
                style={[styles.description, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            )}

            <View style={styles.itemBottom}>
              <Text style={[styles.date, { color: colors.textMuted }]}>
                {item.startDate
                  ? `${formatDate(item.startDate)} ~ ${item.endDate ? formatDate(item.endDate) : "미정"}`
                  : formatDate(item.workDate)}
              </Text>
              {!item.isAcknowledged && (
                <TouchableOpacity
                  style={[styles.ackButton, { backgroundColor: primary }]}
                  onPress={() => handleAcknowledge(item.id)}
                >
                  <Text style={styles.ackButtonText}>확인</Text>
                </TouchableOpacity>
              )}
              {item.isAcknowledged && (
                <Text style={[styles.ackDone, { color: "#22c55e" }]}>
                  ✓ 확인완료
                </Text>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerCount: { fontSize: 14 },
  list: { padding: 16 },
  item: { borderRadius: 8, padding: 16, marginBottom: 8, borderWidth: 1 },
  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  leftInfo: { flexDirection: "row", gap: 8, alignItems: "center" },
  srNumber: { fontSize: 13, fontWeight: "600" },
  stageBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  stageText: { fontSize: 12, fontWeight: "600" },
  hours: { fontSize: 14, fontWeight: "600" },
  taskTitle: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  projectName: { fontSize: 13, marginBottom: 4 },
  description: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  itemBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  date: { fontSize: 12 },
  ackButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  ackButtonText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  ackDone: { fontSize: 13, fontWeight: "600" },
  emptyContainer: { flexGrow: 1, padding: 16 },
});
