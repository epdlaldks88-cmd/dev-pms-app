import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { getProjectDetail, getProjectTasks } from "../api/projects";
import { useTheme } from "../theme/ThemeContext";
import { useFocusEffect } from "@react-navigation/native";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  color: string;
  startDate?: string;
  endDate?: string;
  members: { user: { id: string; name: string }; role: string }[];
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  assignees: { user: { id: string; name: string } }[];
}

export default function ProjectDetailScreen({ route, navigation }: any) {
  const { projectId } = route.params;
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tasks" | "members">("tasks");
  const { primary, colors } = useTheme();

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [projectData, tasksData] = await Promise.all([
            getProjectDetail(projectId),
            getProjectTasks(projectId),
          ]);
          setProject(projectData);
          setTasks(tasksData);
        } catch (error) {
          console.log("프로젝트 조회 실패:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [projectId]),
  );

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      TODO: "할일",
      IN_PROGRESS: "진행중",
      IN_REVIEW: "검토중",
      DONE: "완료",
      CANCELLED: "취소",
      ACTIVE: "진행중",
      COMPLETED: "완료",
      ARCHIVED: "보관",
      ON_HOLD: "보류",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const c: Record<string, string> = {
      TODO: "#94a3b8",
      IN_PROGRESS: primary,
      IN_REVIEW: "#f59e0b",
      DONE: "#22c55e",
      CANCELLED: "#ef4444",
    };
    return c[status] || "#94a3b8";
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

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      OWNER: "소유자",
      ADMIN: "관리자",
      MEMBER: "멤버",
      VIEWER: "뷰어",
    };
    return labels[role] || role;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
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

  if (!project) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>프로젝트를 찾을 수 없습니다</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 헤더 */}
      <View
        style={{
          padding: 16,
          paddingTop: 56,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: primary }]}>← 뒤로</Text>
        </TouchableOpacity>
        <Text
          style={[styles.headerTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {project.name}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {/* 프로젝트 정보 */}
      <View
        style={[
          styles.infoSection,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.infoTop}>
          <View style={[styles.colorDot, { backgroundColor: project.color }]} />
          <Text style={[styles.projectName, { color: colors.text }]}>
            {project.name}
          </Text>
        </View>
        {project.description && (
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {project.description}
          </Text>
        )}
        <View style={styles.infoRow}>
          {project.startDate && (
            <Text style={[styles.infoText, { color: colors.textMuted }]}>
              📅 {formatDate(project.startDate)} ~{" "}
              {formatDate(project.endDate) || "미정"}
            </Text>
          )}
          <View style={[styles.statusBadge, { backgroundColor: "#22c55e20" }]}>
            <Text style={[styles.statusText, { color: "#22c55e" }]}>
              {getStatusLabel(project.status)}
            </Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: primary }]}>
              {tasks.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              전체 태스크
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: "#22c55e" }]}>
              {tasks.filter((t) => t.status === "DONE").length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              완료
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: "#f59e0b" }]}>
              {tasks.filter((t) => t.status === "IN_PROGRESS").length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              진행중
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: colors.textMuted }]}>
              {project.members?.length || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              멤버
            </Text>
          </View>
        </View>
      </View>

      {/* 탭 */}
      <View
        style={[
          styles.tabRow,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "tasks" && {
              borderBottomColor: primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab("tasks")}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "tasks" ? primary : colors.textMuted },
            ]}
          >
            태스크 ({tasks.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "members" && {
              borderBottomColor: primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab("members")}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "members" ? primary : colors.textMuted },
            ]}
          >
            멤버 ({project.members?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>

      {/* 태스크 목록 */}
      {activeTab === "tasks" && (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                태스크가 없습니다
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.taskItem,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() =>
                navigation.navigate("TaskDetail", { taskId: item.id })
              }
            >
              <View style={styles.taskTop}>
                <Text
                  style={[styles.taskTitle, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
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
                    {item.priority === "URGENT"
                      ? "긴급"
                      : item.priority === "HIGH"
                        ? "높음"
                        : item.priority === "MEDIUM"
                          ? "보통"
                          : "낮음"}
                  </Text>
                </View>
              </View>
              <View style={styles.taskBottom}>
                <Text
                  style={[
                    styles.taskStatus,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {getStatusLabel(item.status)}
                </Text>
                {item.dueDate && (
                  <Text style={[styles.dueDate, { color: colors.textMuted }]}>
                    마감 {formatDate(item.dueDate)}
                  </Text>
                )}
                {item.assignees?.length > 0 && (
                  <View style={styles.assignees}>
                    {item.assignees.slice(0, 3).map((a) => (
                      <View
                        key={a.user.id}
                        style={[
                          styles.assigneeAvatar,
                          { backgroundColor: primary },
                        ]}
                      >
                        <Text style={styles.assigneeAvatarText}>
                          {a.user.name.charAt(0)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* 멤버 목록 */}
      {activeTab === "members" && (
        <FlatList
          data={project.members}
          keyExtractor={(item) => item.user.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View
              style={[
                styles.memberItem,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={[styles.memberAvatar, { backgroundColor: primary }]}>
                <Text style={styles.memberAvatarText}>
                  {item.user.name.charAt(0)}
                </Text>
              </View>
              <Text style={[styles.memberName, { color: colors.text }]}>
                {item.user.name}
              </Text>
              <View
                style={[styles.roleBadge, { backgroundColor: primary + "20" }]}
              >
                <Text style={[styles.roleText, { color: primary }]}>
                  {getRoleLabel(item.role)}
                </Text>
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
  backButton: { fontSize: 16, width: 60 },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  infoSection: { padding: 16, borderBottomWidth: 1 },
  infoTop: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  projectName: { fontSize: 18, fontWeight: "bold" },
  description: { fontSize: 14, marginBottom: 8, lineHeight: 20 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  infoText: { fontSize: 13 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: "600" },
  statsRow: { flexDirection: "row", justifyContent: "space-around" },
  stat: { alignItems: "center" },
  statNum: { fontSize: 22, fontWeight: "bold" },
  statLabel: { fontSize: 12, marginTop: 2 },
  tabRow: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 14, fontWeight: "600" },
  list: { padding: 16 },
  taskItem: { borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1 },
  taskTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  taskTitle: { fontSize: 14, fontWeight: "600", flex: 1, marginRight: 8 },
  priorityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  priorityText: { fontSize: 11, fontWeight: "600" },
  taskBottom: { flexDirection: "row", alignItems: "center", gap: 8 },
  taskStatus: { fontSize: 12, fontWeight: "600" },
  dueDate: { fontSize: 12 },
  assignees: { flexDirection: "row", marginLeft: "auto" },
  assigneeAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -4,
  },
  assigneeAvatarText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memberAvatarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  memberName: { fontSize: 15, fontWeight: "600", flex: 1 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  roleText: { fontSize: 12, fontWeight: "600" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  emptyText: { fontSize: 16 },
});
