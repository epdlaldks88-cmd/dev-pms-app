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
import {
  getQAList,
  acceptQA,
  confirmQA,
  rejectQA,
  cancelQA,
  reopenQA,
} from "../api/qa";
import { useTheme } from "../theme/ThemeContext";
import { EmptyState } from "../components/EmptyState";
import { ErrorView } from "../components/ErrorView";
import { SkeletonList } from "../components/SkeletonItem";
import { useFocusEffect } from "@react-navigation/native";
import { formatDate } from "../utils/date";
import Header from "../components/Header";

interface QA {
  id: string;
  qaNumber?: string;
  srNumber: string;
  title: string;
  content?: string;
  tester?: string;
  status: string;
  result?: string;
  createdAt: string;
}

export default function QAScreen({ navigation, showHeader = true }: any) {
  const [qaList, setQaList] = useState<QA[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { primary, colors } = useTheme();
  const [error, setError] = useState(false);

  const fetchQA = async (showLoading: boolean = true) => {
    try {
      setError(false);
      if (showLoading) setLoading(true);
      const data = await getQAList();
      setQaList(data);
    } catch (e) {
      if (__DEV__) console.log("[QAScreen] fetchQA failed");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchQA(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchQA(qaList.length === 0);
    }, [qaList.length]),
  );

  const getStatusLabel = (status: string, result?: string) => {
    if (status === "COMPLETED") {
      if (result === "PASS") return "완료/확인";
      if (result === "REJECTED") return "반려";
      return "완료";
    }
    const labels: Record<string, string> = {
      PENDING: "대기중",
      IN_PROGRESS: "진행중",
      CANCELLED: "취소",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string, result?: string) => {
    if (status === "COMPLETED") {
      if (result === "PASS") return "#22c55e";
      if (result === "REJECTED") return "#ef4444";
      return "#6366f1";
    }
    const c: Record<string, string> = {
      PENDING: "#f59e0b",
      IN_PROGRESS: primary,
      CANCELLED: "#94a3b8",
    };
    return c[status] || "#94a3b8";
  };

  const handleAction = async (id: string, action: string) => {
    try {
      if (action === "accept") await acceptQA(id);
      else if (action === "confirm") await confirmQA(id);
      else if (action === "reject") await rejectQA(id);
      else if (action === "cancel") await cancelQA(id);
      else if (action === "reopen") await reopenQA(id);
      await fetchQA(false); // ⭐ 스켈레톤 깜빡임 방지
    } catch (e) {
      Alert.alert("오류", "처리에 실패했습니다");
    }
  };

  // === 로딩 ===
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {showHeader && <Header title="QA 테스트" />}
        <SkeletonList count={5} />
      </View>
    );
  }

  // === 에러 ===
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {showHeader && <Header title="QA 테스트" />}
        <ErrorView onRetry={() => fetchQA()} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showHeader && (
        <Header
          title="QA 테스트"
          rightElement={
            <Text style={[styles.headerCount, { color: colors.textMuted }]}>
              {qaList.length}건
            </Text>
          }
        />
      )}

      {/* ListEmptyComponent 일원화 */}
      <FlatList
        data={qaList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          qaList.length === 0 ? styles.emptyContainer : styles.list
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        ListEmptyComponent={
          <EmptyState
            icon="help-circle-outline"
            title="QA 항목이 없습니다"
            description="등록된 QA 테스트가 없어요."
          />
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.item,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.itemTop}>
              <Text style={[styles.srNumber, { color: primary }]}>
                {item.srNumber}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      getStatusColor(item.status, item.result) + "20",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(item.status, item.result) },
                  ]}
                >
                  {getStatusLabel(item.status, item.result)}
                </Text>
              </View>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              {item.title}
            </Text>
            {item.content && (
              <Text
                style={[styles.description, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {item.content}
              </Text>
            )}
            <Text style={[styles.date, { color: colors.textMuted }]}>
              {formatDate(item.createdAt)}
            </Text>

            {/* 액션 버튼 */}
            {item.status === "PENDING" && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: primary }]}
                  onPress={() => handleAction(item.id, "accept")}
                >
                  <Text style={styles.actionButtonText}>수락</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#94a3b8" }]}
                  onPress={() => handleAction(item.id, "cancel")}
                >
                  <Text style={styles.actionButtonText}>취소</Text>
                </TouchableOpacity>
              </View>
            )}
            {item.status === "IN_PROGRESS" && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#22c55e" }]}
                  onPress={() => handleAction(item.id, "confirm")}
                >
                  <Text style={styles.actionButtonText}>결과확인</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#ef4444" }]}
                  onPress={() => handleAction(item.id, "reject")}
                >
                  <Text style={styles.actionButtonText}>반려</Text>
                </TouchableOpacity>
              </View>
            )}
            {item.status === "ACCEPTED" && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#22c55e" }]}
                  onPress={() => handleAction(item.id, "confirm")}
                >
                  <Text style={styles.actionButtonText}>확인</Text>
                </TouchableOpacity>
              </View>
            )}
            {(item.status === "COMPLETED" || item.status === "CANCELLED") && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#6366f1" }]}
                  onPress={() => handleAction(item.id, "reopen")}
                >
                  <Text style={styles.actionButtonText}>되돌리기</Text>
                </TouchableOpacity>
              </View>
            )}
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
  emptyContainer: { flexGrow: 1, padding: 16 },
  item: { borderRadius: 8, padding: 16, marginBottom: 8, borderWidth: 1 },
  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  srNumber: { fontSize: 13, fontWeight: "600" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: "600" },
  title: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  description: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  date: { fontSize: 12, marginBottom: 8 },
  actions: { flexDirection: "row", gap: 8, marginTop: 8 },
  actionButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  actionButtonText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
