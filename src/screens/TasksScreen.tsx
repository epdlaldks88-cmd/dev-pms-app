import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { getMyTasks } from "../api/tasks";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  project: { name: string; color: string };
}

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = async () => {
    try {
      const data = await getMyTasks();
      setTasks(data);
    } catch (error) {
      console.log("태스크 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, []);

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
    const colors: Record<string, string> = {
      URGENT: "#ef4444",
      HIGH: "#f97316",
      MEDIUM: "#6366f1",
      LOW: "#94a3b8",
    };
    return colors[priority] || "#94a3b8";
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>내 태스크</Text>
        <Text style={styles.headerCount}>{tasks.length}개</Text>
      </View>

      {tasks.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>배정된 태스크가 없습니다</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item}>
              <View style={styles.itemTop}>
                <View style={styles.projectTag}>
                  <View
                    style={[
                      styles.projectDot,
                      { backgroundColor: item.project?.color || "#6366f1" },
                    ]}
                  />
                  <Text style={styles.projectName}>
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
              <Text style={styles.taskTitle}>{item.title}</Text>
              {item.description && (
                <Text style={styles.description} numberOfLines={1}>
                  {item.description}
                </Text>
              )}
              <View style={styles.itemBottom}>
                <Text style={styles.statusText}>
                  {getStatusLabel(item.status)}
                </Text>
                {item.dueDate && (
                  <Text
                    style={[
                      styles.dueDate,
                      isOverdue(item.dueDate) && styles.overdue,
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
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 56,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  headerCount: {
    fontSize: 14,
    color: "#94a3b8",
  },
  list: {
    padding: 16,
  },
  item: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  projectTag: {
    flexDirection: "row",
    alignItems: "center",
  },
  projectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  projectName: {
    fontSize: 12,
    color: "#64748b",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "600",
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 8,
  },
  itemBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    color: "#6366f1",
    fontWeight: "600",
  },
  dueDate: {
    fontSize: 12,
    color: "#94a3b8",
  },
  overdue: {
    color: "#ef4444",
  },
  emptyText: {
    fontSize: 16,
    color: "#94a3b8",
  },
});
