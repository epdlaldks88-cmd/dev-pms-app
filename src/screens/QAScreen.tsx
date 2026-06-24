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
  Alert,
} from "react-native";
import { getQAList, acceptQA, confirmQA, rejectQA, cancelQA } from "../api/qa";
import { useTheme } from "../theme/ThemeContext";

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

  const fetchQA = async () => {
    try {
      const data = await getQAList();
      setQaList(data);
    } catch (error) {
      console.log("QA 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchQA();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchQA();
  }, []);

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
      await fetchQA();
    } catch (error) {
      Alert.alert("오류", "처리에 실패했습니다");
    }
  };

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
            QA 테스트
          </Text>
          <Text style={[styles.headerCount, { color: colors.textMuted }]}>
            {qaList.length}건
          </Text>
        </View>
      )}
      {qaList.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            QA 항목이 없습니다
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          data={qaList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
                    style={[
                      styles.actionButton,
                      { backgroundColor: "#94a3b8" },
                    ]}
                    onPress={() => handleAction(item.id, "cancel")}
                  >
                    <Text style={styles.actionButtonText}>취소</Text>
                  </TouchableOpacity>
                </View>
              )}
              {item.status === "IN_PROGRESS" && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: "#22c55e" },
                    ]}
                    onPress={() => handleAction(item.id, "confirm")}
                  >
                    <Text style={styles.actionButtonText}>결과확인</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: "#ef4444" },
                    ]}
                    onPress={() => handleAction(item.id, "reject")}
                  >
                    <Text style={styles.actionButtonText}>반려</Text>
                  </TouchableOpacity>
                </View>
              )}
              {item.status === "ACCEPTED" && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: "#22c55e" },
                    ]}
                    onPress={() => handleAction(item.id, "confirm")}
                  >
                    <Text style={styles.actionButtonText}>확인</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 56,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  headerCount: { fontSize: 14 },
  list: { padding: 16 },
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400,
  },
  emptyText: { fontSize: 16 },
});
