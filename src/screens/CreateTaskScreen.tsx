import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../theme/ThemeContext";
import Header from "../components/Header";
import { createTask, getProjectSteps } from "../api/tasks";
import { getProjects } from "../api/projects";
import { KeyboardAvoidingView, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { userStorage } from "../lib/storage";
import { ErrorView } from "../components/ErrorView";

const PRIORITIES = [
  { key: "LOW", label: "낮음", color: "#94a3b8" },
  { key: "MEDIUM", label: "보통", color: "#6366f1" },
  { key: "HIGH", label: "높음", color: "#f97316" },
  { key: "URGENT", label: "긴급", color: "#ef4444" },
];

export default function CreateTaskScreen({ navigation }: any) {
  const { primary, colors } = useTheme();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState("");
  const [stepId, setStepId] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [myId, setMyId] = useState<string | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showDuePicker, setShowDuePicker] = useState(false);
  const [error, setError] = useState(false);

  // useEffect 2개 → 1개로 통합
  const init = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getProjects();
      setProjects(data);
      if (data.length > 0) setProjectId(data[0].id);
    } catch (e) {
      if (__DEV__) console.log("[CreateTask] init failed");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("오류", "제목을 입력해주세요");
      return;
    }
    if (!projectId) {
      Alert.alert("오류", "프로젝트를 선택해주세요");
      return;
    }
    setSaving(true);
    try {
      await createTask(projectId, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        startDate: startDate.trim() || undefined,
        dueDate: dueDate.trim() ? dueDate.trim() : undefined,
        stepId: stepId || undefined,
        assigneeIds: myId ? [myId] : [],
      });
      Alert.alert("완료", "태스크가 생성됐습니다", [
        { text: "확인", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      if (__DEV__) console.log("[CreateTask] save failed");
      Alert.alert("오류", "태스크 생성에 실패했습니다");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="태스크 생성" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="태스크 생성" onBack={() => navigation.goBack()} />
        <ErrorView onRetry={init} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          title="태스크 생성"
          onBack={() => navigation.goBack()}
          rightElement={
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color={primary} />
              ) : (
                <Text
                  style={{ color: primary, fontWeight: "600", fontSize: 16 }}
                >
                  저장
                </Text>
              )}
            </TouchableOpacity>
          }
        />

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* 제목 */}
          <View
            style={[
              styles.section,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              제목 *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="태스크 제목 입력"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* 설명 */}
          <View
            style={[
              styles.section,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              설명
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="태스크 설명 입력"
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          {/* 프로젝트 선택 */}
          <View
            style={[
              styles.section,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              프로젝트 *
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {projects.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.chip,
                      { borderColor: colors.border },
                      projectId === p.id && {
                        backgroundColor: primary,
                        borderColor: primary,
                      },
                    ]}
                    onPress={() => setProjectId(p.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: projectId === p.id ? "#fff" : colors.text },
                      ]}
                    >
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* 단계 선택 */}
          {steps.length > 0 && (
            <View
              style={[
                styles.section,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                단계
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {steps.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={[
                        styles.chip,
                        { borderColor: colors.border },
                        stepId === s.id && {
                          backgroundColor: primary,
                          borderColor: primary,
                        },
                      ]}
                      onPress={() => setStepId(s.id)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: stepId === s.id ? "#fff" : colors.text },
                        ]}
                      >
                        {s.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* 우선순위 */}
          <View
            style={[
              styles.section,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              우선순위
            </Text>
            <View style={styles.chipRow}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity
                  key={p.key}
                  style={[
                    styles.chip,
                    { borderColor: p.color },
                    priority === p.key && { backgroundColor: p.color },
                  ]}
                  onPress={() => setPriority(p.key)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: priority === p.key ? "#fff" : p.color },
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 시작일 */}
          <View
            style={[
              styles.section,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              시작일
            </Text>
            <TouchableOpacity
              style={[
                styles.datePicker,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              onPress={() => setShowStartPicker(true)}
            >
              <Text
                style={{ color: startDate ? colors.text : colors.textMuted }}
              >
                {startDate || "YYYY-MM-DD"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 마감일 */}
          <View
            style={[
              styles.section,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              마감일
            </Text>
            <TouchableOpacity
              style={[
                styles.datePicker,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              onPress={() => setShowDuePicker(true)}
            >
              <Text style={{ color: dueDate ? colors.text : colors.textMuted }}>
                {dueDate || "YYYY-MM-DD"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 날짜 피커 */}
          {showStartPicker && (
            <DateTimePicker
              value={startDate ? new Date(startDate) : new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowStartPicker(false);
                if (date) {
                  setStartDate(date.toISOString().split("T")[0]);
                }
              }}
            />
          )}
          {showDuePicker && (
            <DateTimePicker
              value={dueDate ? new Date(dueDate) : new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDuePicker(false);
                if (date) {
                  setDueDate(date.toISOString().split("T")[0]);
                }
              }}
            />
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { flex: 1 },
  section: { padding: 16, marginBottom: 8, borderWidth: 1 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 14 },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: "500" },
  datePicker: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
});
