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
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../theme/ThemeContext";
import Header from "../components/Header";
import { createMeeting } from "../api/meetings";
import { getProjects } from "../api/projects";
import { getAllUsers } from "../api/users";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CreateMeetingScreen({ navigation }: any) {
  const { primary, colors } = useTheme();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [attendees, setAttendees] = useState("");
  const [projectId, setProjectId] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    [],
  );
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [projectsData, usersData, userId] = await Promise.all([
          getProjects(),
          getAllUsers(),
          AsyncStorage.getItem("userId"),
        ]);
        setProjects(projectsData);
        setUsers(usersData);
        setMyId(userId);
        if (userId) setSelectedParticipants([userId]);
      } catch (error) {
        console.log("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("오류", "제목을 입력해주세요");
      return;
    }
    setSaving(true);
    try {
      await createMeeting({
        title: title.trim(),
        content: content.trim() || undefined,
        meetingDate: meetingDate || undefined,
        startTime: startTime.trim() || undefined,
        endTime: endTime.trim() || undefined,
        location: location.trim() || undefined,
        attendees: attendees.trim() || undefined,
        projectId: projectId || undefined,
        participantIds: selectedParticipants,
      });
      Alert.alert("완료", "회의가 등록됐습니다", [
        { text: "확인", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("오류", "회의 등록에 실패했습니다");
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
          title="회의 등록"
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
              placeholder="회의 제목 입력"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* 회의 날짜 */}
          <View
            style={[
              styles.section,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              회의 날짜
            </Text>
            <TouchableOpacity
              style={[
                styles.datePicker,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text
                style={{ color: meetingDate ? colors.text : colors.textMuted }}
              >
                {meetingDate || "날짜 선택"}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={meetingDate ? new Date(meetingDate) : new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setMeetingDate(date.toISOString().split("T")[0]);
                }}
              />
            )}
          </View>

          {/* 시간 */}
          <View
            style={[
              styles.section,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              시간
            </Text>
            <View style={styles.timeRow}>
              <TextInput
                style={[
                  styles.timeInput,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
                placeholder="시작 (HH:MM)"
                placeholderTextColor={colors.textMuted}
                value={startTime}
                onChangeText={setStartTime}
              />
              <Text style={[styles.timeSep, { color: colors.textMuted }]}>
                ~
              </Text>
              <TextInput
                style={[
                  styles.timeInput,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
                placeholder="종료 (HH:MM)"
                placeholderTextColor={colors.textMuted}
                value={endTime}
                onChangeText={setEndTime}
              />
            </View>
          </View>

          {/* 장소 */}
          <View
            style={[
              styles.section,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              장소
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
              placeholder="회의 장소 입력"
              placeholderTextColor={colors.textMuted}
              value={location}
              onChangeText={setLocation}
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
              프로젝트
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    { borderColor: colors.border },
                    !projectId && {
                      backgroundColor: primary,
                      borderColor: primary,
                    },
                  ]}
                  onPress={() => setProjectId("")}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: !projectId ? "#fff" : colors.text },
                    ]}
                  >
                    없음
                  </Text>
                </TouchableOpacity>
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

          {/* 참석자 */}
          <View
            style={[
              styles.section,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              참석자
            </Text>
            {users.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[styles.userItem, { borderBottomColor: colors.border }]}
                onPress={() => toggleParticipant(user.id)}
              >
                <View
                  style={[
                    styles.checkbox,
                    { borderColor: primary },
                    selectedParticipants.includes(user.id) && {
                      backgroundColor: primary,
                    },
                  ]}
                >
                  {selectedParticipants.includes(user.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <View style={[styles.userAvatar, { backgroundColor: primary }]}>
                  <Text style={styles.userAvatarText}>
                    {user.name?.charAt(0) || "?"}
                  </Text>
                </View>
                <Text style={[styles.userName, { color: colors.text }]}>
                  {user.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 회의 내용 */}
          <View
            style={[
              styles.section,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              회의 내용
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
              placeholder="회의 내용 입력"
              placeholderTextColor={colors.textMuted}
              value={content}
              onChangeText={setContent}
              multiline
            />
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
    minHeight: 100,
    textAlignVertical: "top",
  },
  datePicker: { borderWidth: 1, borderRadius: 8, padding: 12 },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  timeSep: { fontSize: 16 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: "500" },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkmark: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  userAvatarText: { color: "#fff", fontWeight: "bold" },
  userName: { fontSize: 14 },
});
