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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "../theme/ThemeContext";
import Header from "../components/Header";
import { createIssue } from "../api/issues";
import { getProjects } from "../api/projects";
import { getAllUsers } from "../api/users";

const RISK_LEVELS = [
  { key: "LOW", label: "낮음", color: "#22c55e" },
  { key: "MEDIUM", label: "보통", color: "#f59e0b" },
  { key: "HIGH", label: "높음", color: "#f97316" },
  { key: "CRITICAL", label: "심각", color: "#ef4444" },
];

export default function CreateIssueScreen({ navigation }: any) {
  const { primary, colors } = useTheme();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [riskLevel, setRiskLevel] = useState("MEDIUM");
  const [projectId, setProjectId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [projectsData, usersData] = await Promise.all([
          getProjects(),
          getAllUsers(),
        ]);
        setProjects(projectsData);
        setUsers(usersData);
        if (projectsData.length > 0) setProjectId(projectsData[0].id);
      } catch (error) {
        console.log("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
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
      await createIssue(projectId, {
        title: title.trim(),
        description: description.trim() || undefined,
        riskLevel,
        assigneeId: assigneeId || undefined,
      });
      Alert.alert("완료", "이슈가 등록됐습니다", [
        { text: "확인", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("오류", "이슈 등록에 실패했습니다");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={primary} />
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
          title="이슈 등록"
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
              placeholder="이슈 제목 입력"
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
              placeholder="이슈 설명 입력"
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          {/* 프로젝트 */}
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

          {/* 위험도 */}
          <View
            style={[
              styles.section,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              위험도
            </Text>
            <View style={styles.chipRow}>
              {RISK_LEVELS.map((r) => (
                <TouchableOpacity
                  key={r.key}
                  style={[
                    styles.chip,
                    { borderColor: r.color },
                    riskLevel === r.key && { backgroundColor: r.color },
                  ]}
                  onPress={() => setRiskLevel(r.key)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: riskLevel === r.key ? "#fff" : r.color },
                    ]}
                  >
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 담당자 */}
          <View
            style={[
              styles.section,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              담당자
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    { borderColor: colors.border },
                    !assigneeId && {
                      backgroundColor: primary,
                      borderColor: primary,
                    },
                  ]}
                  onPress={() => setAssigneeId("")}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: !assigneeId ? "#fff" : colors.text },
                    ]}
                  >
                    없음
                  </Text>
                </TouchableOpacity>
                {users.map((u) => (
                  <TouchableOpacity
                    key={u.id}
                    style={[
                      styles.chip,
                      { borderColor: colors.border },
                      assigneeId === u.id && {
                        backgroundColor: primary,
                        borderColor: primary,
                      },
                    ]}
                    onPress={() => setAssigneeId(u.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: assigneeId === u.id ? "#fff" : colors.text },
                      ]}
                    >
                      {u.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

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
});
