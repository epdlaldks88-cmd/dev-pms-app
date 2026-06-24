import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTaskDetail, updateTaskStatus, createComment } from "../api/tasks";
import { useTheme } from "../theme/ThemeContext";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  project: { name: string; color: string };
  assignees: { user: { id: string; name: string } }[];
  comments: any[];
  subTasks?: { id: string; title: string; status: string }[];
  _count?: { subTasks: number };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: { name: string };
}

const STATUS_OPTIONS = [
  { value: "TODO", label: "할일", color: "#94a3b8" },
  { value: "IN_PROGRESS", label: "진행중", color: "#6366f1" },
  { value: "IN_REVIEW", label: "검토중", color: "#f59e0b" },
  { value: "DONE", label: "완료", color: "#22c55e" },
  { value: "CANCELLED", label: "취소", color: "#ef4444" },
];

export default function TaskDetailScreen({ route, navigation }: any) {
  const { taskId } = route.params;
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const insets = useSafeAreaInsets();
  const { primary, colors } = useTheme();

  const fetchTask = async () => {
    try {
      const data = await getTaskDetail(taskId);
      setTask(data);
      setComments(data.comments || []);
    } catch (error) {
      console.log("태스크 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, []);

  const handleStatusChange = async (status: string) => {
    try {
      await updateTaskStatus(taskId, status);
      setShowStatusPicker(false);
      await fetchTask();
    } catch (error) {
      Alert.alert("오류", "상태 변경에 실패했습니다");
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await createComment(taskId, comment.trim());
      setComment("");
      await fetchTask();
    } catch (error) {
      Alert.alert("오류", "댓글 작성에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
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

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      URGENT: "긴급",
      HIGH: "높음",
      MEDIUM: "보통",
      LOW: "낮음",
    };
    return labels[priority] || priority;
  };

  const getCurrentStatus = () =>
    STATUS_OPTIONS.find((s) => s.value === task?.status) || STATUS_OPTIONS[0];

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

  if (!task) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>태스크를 찾을 수 없습니다</Text>
      </View>
    );
  }

  const currentStatus = getCurrentStatus();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
            paddingTop: 56,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: primary }]}>← 뒤로</Text>
          </TouchableOpacity>
          <Text
            style={[styles.headerTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            태스크 상세
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.content}>
          <View
            style={[
              styles.section,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.projectTag}>
              <View
                style={[
                  styles.projectDot,
                  { backgroundColor: task.project?.color || primary },
                ]}
              />
              <Text
                style={[styles.projectName, { color: colors.textSecondary }]}
              >
                {task.project?.name}
              </Text>
            </View>
            <Text style={[styles.taskTitle, { color: colors.text }]}>
              {task.title}
            </Text>
            {task.description && (
              <Text
                style={[styles.description, { color: colors.textSecondary }]}
              >
                {task.description}
              </Text>
            )}
          </View>

          <View
            style={[
              styles.section,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.row}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                  우선순위
                </Text>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: getPriorityColor(task.priority) + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: getPriorityColor(task.priority) },
                    ]}
                  >
                    {getPriorityLabel(task.priority)}
                  </Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                  상태
                </Text>
                <TouchableOpacity
                  style={[
                    styles.badge,
                    { backgroundColor: currentStatus.color + "20" },
                  ]}
                  onPress={() => setShowStatusPicker(!showStatusPicker)}
                >
                  <Text
                    style={[styles.badgeText, { color: currentStatus.color }]}
                  >
                    {currentStatus.label} ▼
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {showStatusPicker && (
              <View
                style={[
                  styles.statusPicker,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                {STATUS_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.statusOption,
                      task.status === option.value && {
                        backgroundColor: primary + "10",
                      },
                    ]}
                    onPress={() => handleStatusChange(option.value)}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: option.color },
                      ]}
                    />
                    <Text
                      style={[styles.statusOptionText, { color: colors.text }]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {task.dueDate && (
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                  마감일
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {formatDate(task.dueDate)}
                </Text>
              </View>
            )}
          </View>

          {task.assignees?.length > 0 && (
            <View
              style={[
                styles.section,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                담당자
              </Text>
              {task.assignees.map((a) => (
                <View key={a.user.id} style={styles.assignee}>
                  <View
                    style={[
                      styles.assigneeAvatar,
                      { backgroundColor: primary },
                    ]}
                  >
                    <Text style={styles.assigneeAvatarText}>
                      {a.user.name.charAt(0)}
                    </Text>
                  </View>
                  <Text style={[styles.assigneeName, { color: colors.text }]}>
                    {a.user.name}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* 서브태스크 */}
          {task.subTasks && task.subTasks.length > 0 && (
            <View
              style={[
                styles.section,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                서브태스크 ({task.subTasks.length})
              </Text>
              {task.subTasks.map((sub) => (
                <TouchableOpacity
                  key={sub.id}
                  style={[styles.subTask, { borderColor: colors.border }]}
                  onPress={() =>
                    navigation.push("TaskDetail", { taskId: sub.id })
                  }
                >
                  <View
                    style={[
                      styles.subTaskDot,
                      {
                        backgroundColor:
                          sub.status === "DONE" ? "#22c55e" : colors.border,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.subTaskTitle,
                      {
                        color:
                          sub.status === "DONE"
                            ? colors.textMuted
                            : colors.text,
                      },
                      sub.status === "DONE" && {
                        textDecorationLine: "line-through",
                      },
                    ]}
                  >
                    {sub.title}
                  </Text>
                  <Text style={[styles.subTaskStatus, { color: primary }]}>
                    ›
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View
            style={[
              styles.section,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              댓글 {comments.length}개
            </Text>
            {comments.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                댓글이 없습니다
              </Text>
            ) : (
              comments.map((c) => (
                <View key={c.id} style={styles.comment}>
                  <View style={styles.commentHeader}>
                    <View
                      style={[
                        styles.commentAvatar,
                        { backgroundColor: primary },
                      ]}
                    >
                      <Text style={styles.commentAvatarText}>
                        {c.author?.name?.charAt(0)}
                      </Text>
                    </View>
                    <Text
                      style={[styles.commentAuthor, { color: colors.text }]}
                    >
                      {c.author?.name}
                    </Text>
                    <Text
                      style={[styles.commentDate, { color: colors.textMuted }]}
                    >
                      {formatDate(c.createdAt)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.commentContent,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {c.content}
                  </Text>
                </View>
              ))
            )}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>

        <View
          style={[
            styles.commentInput,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + 12,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="댓글 입력..."
            placeholderTextColor={colors.textMuted}
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: primary },
              !comment.trim() && { backgroundColor: primary + "60" },
            ]}
            onPress={handleAddComment}
            disabled={submitting || !comment.trim()}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>전송</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  content: { flex: 1 },
  section: {
    padding: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderWidth: 1,
  },
  projectTag: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  projectDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  projectName: { fontSize: 12 },
  taskTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  description: { fontSize: 14, lineHeight: 20 },
  row: { flexDirection: "row", gap: 16, marginBottom: 8 },
  infoItem: { marginBottom: 8 },
  infoLabel: { fontSize: 12, marginBottom: 4 },
  infoValue: { fontSize: 14 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 13, fontWeight: "600" },
  statusPicker: {
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    overflow: "hidden",
  },
  statusOption: { flexDirection: "row", alignItems: "center", padding: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusOptionText: { fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  assignee: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  assigneeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  assigneeAvatarText: { color: "#fff", fontWeight: "bold" },
  assigneeName: { fontSize: 14 },
  comment: { marginBottom: 16 },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  commentAvatarText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  commentAuthor: { fontSize: 13, fontWeight: "600", marginRight: 8 },
  commentDate: { fontSize: 12 },
  commentContent: { fontSize: 14, lineHeight: 20, paddingLeft: 36 },
  emptyText: { fontSize: 14 },
  commentInput: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  sendButtonText: { color: "#fff", fontWeight: "bold" },
  subTask: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  subTaskDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  subTaskTitle: { flex: 1, fontSize: 14 },
  subTaskStatus: { fontSize: 18 },
});
