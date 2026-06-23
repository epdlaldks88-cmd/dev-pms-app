import React, { useState, useEffect, useCallback } from "react";
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
import {
  getTaskDetail,
  updateTaskStatus,
  getComments,
  createComment,
} from "../api/tasks";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  const fetchTask = async () => {
    try {
      const data = await getTaskDetail(taskId);
      setTask(data);
      setComments(data.comments || []); // 태스크 상세에서 댓글 가져오기
    } catch (error) {
      console.log("태스크 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const data = await getComments(taskId);
      setComments(data);
    } catch (error) {
      console.log("댓글 조회 실패:", error);
    }
  };

  useEffect(() => {
    fetchTask();
  }, []);

  const handleStatusChange = async (status: string) => {
    try {
      await updateTaskStatus(taskId, status);
      setShowStatusPicker(false);
      await fetchTask(); // 상태 변경 후 재조회
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
      await fetchTask(); // 댓글 포함 전체 재조회
    } catch (error) {
      Alert.alert("오류", "댓글 작성에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
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

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      URGENT: "긴급",
      HIGH: "높음",
      MEDIUM: "보통",
      LOW: "낮음",
    };
    return labels[priority] || priority;
  };

  const getCurrentStatus = () => {
    return (
      STATUS_OPTIONS.find((s) => s.value === task?.status) || STATUS_OPTIONS[0]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.center}>
        <Text>태스크를 찾을 수 없습니다</Text>
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
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            태스크 상세
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.content}>
          {/* 태스크 기본 정보 */}
          <View style={styles.section}>
            <View style={styles.projectTag}>
              <View
                style={[
                  styles.projectDot,
                  { backgroundColor: task.project?.color || "#6366f1" },
                ]}
              />
              <Text style={styles.projectName}>{task.project?.name}</Text>
            </View>
            <Text style={styles.taskTitle}>{task.title}</Text>
            {task.description && (
              <Text style={styles.description}>{task.description}</Text>
            )}
          </View>

          {/* 상태 & 우선순위 */}
          <View style={styles.section}>
            <View style={styles.row}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>우선순위</Text>
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
                <Text style={styles.infoLabel}>상태</Text>
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

            {/* 상태 선택 */}
            {showStatusPicker && (
              <View style={styles.statusPicker}>
                {STATUS_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.statusOption,
                      task.status === option.value && styles.statusOptionActive,
                    ]}
                    onPress={() => handleStatusChange(option.value)}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: option.color },
                      ]}
                    />
                    <Text style={styles.statusOptionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {task.dueDate && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>마감일</Text>
                <Text style={styles.infoValue}>{formatDate(task.dueDate)}</Text>
              </View>
            )}
          </View>

          {/* 담당자 */}
          {task.assignees?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>담당자</Text>
              {task.assignees.map((a) => (
                <View key={a.user.id} style={styles.assignee}>
                  <View style={styles.assigneeAvatar}>
                    <Text style={styles.assigneeAvatarText}>
                      {a.user.name.charAt(0)}
                    </Text>
                  </View>
                  <Text style={styles.assigneeName}>{a.user.name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 댓글 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>댓글 {comments.length}개</Text>
            {comments.length === 0 ? (
              <Text style={styles.emptyText}>댓글이 없습니다</Text>
            ) : (
              comments.map((c) => (
                <View key={c.id} style={styles.comment}>
                  <View style={styles.commentHeader}>
                    <View style={styles.commentAvatar}>
                      <Text style={styles.commentAvatarText}>
                        {c.author?.name?.charAt(0)}
                      </Text>
                    </View>
                    <Text style={styles.commentAuthor}>{c.author?.name}</Text>
                    <Text style={styles.commentDate}>
                      {formatDate(c.createdAt)}
                    </Text>
                  </View>
                  <Text style={styles.commentContent}>{c.content}</Text>
                </View>
              ))
            )}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* 댓글 입력 */}
        <View
          style={[styles.commentInput, { paddingBottom: insets.bottom + 12 }]}
        >
          <TextInput
            style={[styles.input, { color: "#000000" }]}
            placeholder="댓글 입력..."
            value={comment}
            onChangeText={setComment}
            multiline
            placeholderTextColor="#94a3b8"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !comment.trim() && styles.sendButtonDisabled,
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
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 56, // 다시 고정값으로
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: { fontSize: 16, color: "#6366f1", width: 60 },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    flex: 1,
    textAlign: "center",
  },
  content: { flex: 1 },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: "#e2e8f0",
  },
  projectTag: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  projectDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  projectName: { fontSize: 12, color: "#64748b" },
  taskTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  description: { fontSize: 14, color: "#64748b", lineHeight: 20 },
  row: { flexDirection: "row", gap: 16, marginBottom: 8 },
  infoItem: { marginBottom: 8 },
  infoLabel: { fontSize: 12, color: "#94a3b8", marginBottom: 4 },
  infoValue: { fontSize: 14, color: "#1e293b" },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 13, fontWeight: "600" },
  statusPicker: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginTop: 8,
    overflow: "hidden",
  },
  statusOption: { flexDirection: "row", alignItems: "center", padding: 12 },
  statusOptionActive: { backgroundColor: "#6366f110" },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusOptionText: { fontSize: 14, color: "#1e293b" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  assignee: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  assigneeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  assigneeAvatarText: { color: "#fff", fontWeight: "bold" },
  assigneeName: { fontSize: 14, color: "#1e293b" },
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
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  commentAvatarText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  commentAuthor: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
    marginRight: 8,
  },
  commentDate: { fontSize: 12, color: "#94a3b8" },
  commentContent: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    paddingLeft: 36,
  },
  emptyText: { fontSize: 14, color: "#94a3b8" },
  commentInput: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 8,
    backgroundColor: "#f8fafc",
  },
  sendButton: {
    backgroundColor: "#6366f1",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendButtonDisabled: { backgroundColor: "#c7d2fe" },
  sendButtonText: { color: "#fff", fontWeight: "bold" },
});
