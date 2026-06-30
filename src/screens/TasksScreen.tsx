import React, { useState, useCallback, memo } from "react";
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
import { formatDate } from "../utils/date";
import Header from "../components/Header";
import { SkeletonList } from "../components/SkeletonItem";
import { EmptyState } from "../components/EmptyState";
import { ErrorView } from "../components/ErrorView";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  project: { name: string; color: string };
  startDate?: string;
}

type FilterType = "ALL" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

const FILTER_LABELS: Record<FilterType, string> = {
  ALL: "전체",
  TODO: "할일",
  IN_PROGRESS: "진행중",
  IN_REVIEW: "검토중",
  DONE: "완료",
};

export default function TasksScreen({ navigation, showHeader = true }: any) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { primary, colors } = useTheme();
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchTasks = async (
    pageNum: number = 1,
    showLoading: boolean = true,
  ) => {
    try {
      setError(false);
      if (showLoading) setLoading(true);
      const result = await getMyTasks(pageNum);
      if (pageNum === 1) {
        setTasks(result.data);
      } else {
        setTasks((prev) => [...prev, ...result.data]);
      }
      setHasMore(result.hasMore);
      setPage(pageNum);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const TaskItem = memo(({ item, colors, primary, onPress }: any) => {
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

    const isOverdue = (dateString?: string) => {
      if (!dateString) return false;
      return new Date(dateString) < new Date();
    };

    return (
      <TouchableOpacity
        style={[
          styles.item,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        onPress={() => onPress(item.id)}
      >
        <View style={styles.itemTop}>
          <View style={styles.projectTag}>
            <View
              style={[
                styles.projectDot,
                { backgroundColor: item.project?.color || primary },
              ]}
            />
            <Text style={[styles.projectName, { color: colors.textSecondary }]}>
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
                  color: isOverdue(item.dueDate) ? "#ef4444" : colors.textMuted,
                },
              ]}
            >
              마감 {formatDate(item.dueDate)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTasks(1, false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTasks(1, tasks.length === 0);
    }, [tasks.length]),
  );

  // === 로딩 (Header 포함) ===
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {showHeader && <Header title="내 태스크" />}
        <SkeletonList count={5} />
      </View>
    );
  }

  // === 에러 (Header 포함) ===
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {showHeader && <Header title="내 태스크" />}
        <ErrorView onRetry={() => fetchTasks(1)} />
      </View>
    );
  }

  // === 필터 적용된 데이터 ===
  const filteredTasks =
    filter === "ALL" ? tasks : tasks.filter((t) => t.status === filter);

  // === 필터별 빈 상태 메시지 ===
  const getEmptyProps = () => {
    if (tasks.length === 0) {
      return {
        icon: "checkmark-circle-outline" as const,
        title: "배정된 태스크가 없습니다",
        description: "새 태스크가 할당되면 여기에 표시됩니다.",
      };
    }
    return {
      icon: "funnel-outline" as const,
      title: `'${FILTER_LABELS[filter]}' 상태의 태스크가 없습니다`,
      description: "다른 필터를 선택해보세요.",
    };
  };

  const emptyProps = getEmptyProps();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showHeader && (
        <Header
          title="내 태스크"
          rightElement={
            <TouchableOpacity onPress={() => navigation.navigate("CreateTask")}>
              <Text style={{ color: primary, fontWeight: "600" }}>+ 생성</Text>
            </TouchableOpacity>
          }
        />
      )}

      {/* 필터 바 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[
          styles.filterBar,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
        contentContainerStyle={styles.filterContent}
      >
        {(Object.keys(FILTER_LABELS) as FilterType[]).map((key) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.filterButton,
              { borderColor: colors.border },
              filter === key && {
                backgroundColor: primary,
                borderColor: primary,
              },
            ]}
            onPress={() => setFilter(key)}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.filterText,
                { color: filter === key ? "#fff" : colors.textSecondary },
              ]}
            >
              {FILTER_LABELS[key]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 리스트 (Empty는 ListEmptyComponent로 일원화) */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          filteredTasks.length === 0 ? styles.emptyContainer : styles.list
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={() => {
          // 페이지네이션은 전체 필터일 때만 (다른 필터는 클라 사이드)
          if (hasMore && !loadingMore && filter === "ALL") {
            setLoadingMore(true);
            fetchTasks(page + 1, false);
          }
        }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              size="small"
              color={primary}
              style={{ marginVertical: 16 }}
            />
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon={emptyProps.icon}
            title={emptyProps.title}
            description={emptyProps.description}
          />
        }
        renderItem={({ item }) => (
          <TaskItem
            item={item}
            colors={colors}
            primary={primary}
            onPress={(id: string) =>
              navigation.navigate("TaskDetail", { taskId: id })
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  emptyContainer: { flexGrow: 1, padding: 16 },
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
  filterBar: {
    borderBottomWidth: 1,
    height: 56,
    flexGrow: 0,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
    height: 56,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    flexShrink: 0,
  },
  filterText: { fontSize: 13, fontWeight: "500", flexShrink: 0 },
});
