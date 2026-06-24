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
import { getMyTasks } from "../api/tasks";
import { useTheme } from "../theme/ThemeContext";
import { useFocusEffect } from "@react-navigation/native";
import ErrorView from "../components/ErrorView";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  project: { name: string; color: string };
}

export default function TasksScreen({ navigation, showHeader = true }: any) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { primary, colors } = useTheme();
  const [error, setError] = useState(false);

  const fetchTasks = async () => {
    try {
      setError(false);
      const data = await getMyTasks();
      setTasks(data);
    } catch (error) {
      console.log("태스크 조회 실패:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetch = async () => {
        setLoading(true);
        await fetchTasks();
      };
      fetch();
    }, []),
  );

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      URGENT: "긴급",
      HIGH: "높음",
      MEDIUM: "보통",
      LOW: "낮음",
    };
    return labels[priority] || priority;
  };

  const getPriorityColor = (priority: string) => {
    const c: Record<string, string> = {
      URGENT: "#ef4444",
      HIGH: "#f97316",
      MEDIUM: primary,
      LOW: "#94a3b8",
    };
    return c[priority] || "#94a3b8";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      TODO: "할일",
      IN_PROGRESS: "진행중",
      IN_REVIEW: "검토중",
      DONE: "완료",
      CANCELLED: "취소",
    };
    return labels[status] || status;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  if (error) {
    return <ErrorView onRetry={fetchTasks} />;
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
            내 태스크
          </Text>
          <Text style={[styles.headerCount, { color: colors.textMuted }]}>
            {tasks.length}개
          </Text>
        </View>
      )}
      {tasks.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            배정된 태스크가 없습니다
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.item,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() =>
                navigation.navigate("TaskDetail", { taskId: item.id })
              }
            >
              <View style={styles.itemTop}>
                <View style={styles.projectTag}>
                  <View
                    style={[
                      styles.projectDot,
                      { backgroundColor: item.project?.color || primary },
                    ]}
                  />
                  <Text
                    style={[
                      styles.projectName,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {item.project?.name || "프로젝트 없음"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(item.priority) + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      { color: getPriorityColor(item.priority) },
                    ]}
                  >
                    {getPriorityLabel(item.priority)}
                  </Text>
                </View>
              </View>
              <Text style={[styles.taskTitle, { color: colors.text }]}>
                {item.title}
              </Text>
              {item.description && (
                <Text
                  style={[styles.description, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {item.description}
                </Text>
              )}
              <View style={styles.itemBottom}>
                <Text style={[styles.statusText, { color: primary }]}>
                  {getStatusLabel(item.status)}
                </Text>
                {item.dueDate && (
                  <Text
                    style={[
                      styles.dueDate,
                      {
                        color: isOverdue(item.dueDate)
                          ? "#ef4444"
                          : colors.textMuted,
                      },
                    ]}
                  >
                    마감 {formatDate(item.dueDate)}
                  </Text>
                )}
              </View>
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
  projectTag: { flexDirection: "row", alignItems: "center" },
  projectDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  projectName: { fontSize: 12 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  priorityText: { fontSize: 11, fontWeight: "600" },
  taskTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  description: { fontSize: 13, marginBottom: 8 },
  itemBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  statusText: { fontSize: 12, fontWeight: "600" },
  dueDate: { fontSize: 12 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400,
  },
  emptyText: { fontSize: 16 },
});
