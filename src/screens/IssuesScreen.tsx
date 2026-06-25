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
import { getIssues, updateIssue } from "../api/issues";
import { getProjects } from "../api/projects";
import { useTheme } from "../theme/ThemeContext";
import ErrorView from "../components/ErrorView";
import { useFocusEffect } from "@react-navigation/native";
import {
  formatDate,
  formatDateLabel,
  formatTime,
  formatRelative,
} from "../utils/date";
import Header from "../components/Header";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SkeletonList } from "../components/SkeletonItem";
import EmptyState from "../components/EmptyState";

interface Issue {
  id: string;
  title: string;
  description?: string;
  riskLevel: string;
  status: string;
  createdAt: string;
  project?: { id: string; name: string; color: string };
  createdBy: { name: string };
  assignee?: { name: string };
}

export default function IssuesScreen({ navigation, showHeader = true }: any) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { primary, colors } = useTheme();
  const [error, setError] = useState(false);

  const fetchIssues = async () => {
    try {
      setError(false);
      const projects = await getProjects();
      const issuePromises = projects.map((project: any) =>
        getIssues(project.id)
          .then((data: any[]) =>
            data.map((i: any) => ({
              ...i,
              project: {
                id: project.id,
                name: project.name,
                color: project.color,
              },
            })),
          )
          .catch(() => []),
      );
      const issueArrays = await Promise.all(issuePromises);
      const allIssues = issueArrays
        .flat()
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      setIssues(allIssues);
    } catch (error) {
      console.log("이슈 조회 실패:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchIssues();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetch = async () => {
        setLoading(true);
        await fetchIssues();
      };
      fetch();
    }, []),
  );

  const getRiskLabel = (risk: string) => {
    const labels: Record<string, string> = {
      LOW: "낮음",
      MEDIUM: "보통",
      HIGH: "높음",
      CRITICAL: "심각",
    };
    return labels[risk] || risk;
  };

  const getRiskColor = (risk: string) => {
    const c: Record<string, string> = {
      LOW: "#22c55e",
      MEDIUM: "#f59e0b",
      HIGH: "#f97316",
      CRITICAL: "#ef4444",
    };
    return c[risk] || "#94a3b8";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      OPEN: "열림",
      IN_REVIEW: "검토중",
      RESOLVED: "해결됨",
      ON_HOLD: "보류",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const c: Record<string, string> = {
      OPEN: "#ef4444",
      IN_REVIEW: "#f59e0b",
      RESOLVED: "#22c55e",
      ON_HOLD: "#94a3b8",
    };
    return c[status] || "#94a3b8";
  };

  const handleStatusChange = async (issue: Issue, newStatus: string) => {
    try {
      await updateIssue(issue.project!.id, issue.id, { status: newStatus });
      await fetchIssues();
    } catch (error) {
      Alert.alert("오류", "상태 변경에 실패했습니다");
    }
  };

  const showStatusPicker = (issue: Issue) => {
    Alert.alert("상태 변경", "변경할 상태를 선택해주세요", [
      { text: "열림", onPress: () => handleStatusChange(issue, "OPEN") },
      { text: "검토중", onPress: () => handleStatusChange(issue, "IN_REVIEW") },
      { text: "해결됨", onPress: () => handleStatusChange(issue, "RESOLVED") },
      { text: "보류", onPress: () => handleStatusChange(issue, "ON_HOLD") },
      { text: "취소", style: "cancel" },
    ]);
  };

  if (loading) {
    return (
      <View style={[{ flex: 1 }, { backgroundColor: colors.background }]}>
        {showHeader && <Header title="이슈 관리" />}
        <SkeletonList count={5} />
      </View>
    );
  }

  if (error) {
    return <ErrorView onRetry={fetchIssues} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showHeader && (
        <Header
          title="이슈 관리"
          rightElement={
            <Text style={[styles.headerCount, { color: colors.textMuted }]}>
              {issues.length}건
            </Text>
          } // 기존 우측 버튼이 있으면 유지
        />
      )}
      {issues.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <EmptyState
            icon="⚠️"
            title="이슈가 없습니다"
            description="등록된 이슈가 없어요"
          />
        </ScrollView>
      ) : (
        <FlatList
          data={issues}
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
                item.riskLevel === "CRITICAL" && {
                  borderLeftWidth: 3,
                  borderLeftColor: "#ef4444",
                },
              ]}
            >
              <View style={styles.itemTop}>
                <View style={styles.badges}>
                  <View
                    style={[
                      styles.riskBadge,
                      { backgroundColor: getRiskColor(item.riskLevel) + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.riskText,
                        { color: getRiskColor(item.riskLevel) },
                      ]}
                    >
                      {getRiskLabel(item.riskLevel)}
                    </Text>
                  </View>
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
                <TouchableOpacity
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) + "20" },
                  ]}
                  onPress={() => showStatusPicker(item)}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(item.status) },
                    ]}
                  >
                    {getStatusLabel(item.status)} ▼
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                {item.title}
              </Text>
              {item.description && (
                <Text
                  style={[styles.description, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
              )}
              <View style={styles.itemBottom}>
                <Text style={[styles.meta, { color: colors.textMuted }]}>
                  {item.createdBy?.name} · {formatDate(item.createdAt)}
                </Text>
                {item.assignee && (
                  <Text style={[styles.assignee, { color: primary }]}>
                    담당: {item.assignee.name}
                  </Text>
                )}
              </View>
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
  badges: { flexDirection: "row", gap: 6, flex: 1 },
  riskBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  riskText: { fontSize: 12, fontWeight: "600" },
  projectTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  projectText: { fontSize: 12, fontWeight: "600" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: "600" },
  title: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  description: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  itemBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  meta: { fontSize: 12 },
  assignee: { fontSize: 12, fontWeight: "600" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400,
  },
  emptyText: { fontSize: 16 },
});
