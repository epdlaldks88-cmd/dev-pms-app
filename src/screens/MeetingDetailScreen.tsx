import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { formatDate } from "../utils/date";
import Header from "../components/Header";
import { TextInput, Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  getMeetingDetail,
  updateMeeting,
  deleteMeeting,
} from "../api/meetings";
import { RefreshControl } from "react-native";
import { userStorage } from "../lib/storage";

interface Meeting {
  id: string;
  title: string;
  content?: string;
  meetingDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  project?: { name: string; color: string };
  participants: { user: { id: string; name: string } }[];
  createdBy: { name: string };
  attendees?: string;
}

export default function MeetingDetailScreen({ route, navigation }: any) {
  const { meetingId } = route.params;
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const { primary, colors } = useTheme();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    startTime: "",
    endTime: "",
    location: "",
    attendees: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [meetingDate, setMeetingDate] = useState("");
  const [myId, setMyId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const handleSave = async () => {
    if (!editForm.title.trim()) {
      Alert.alert("오류", "제목을 입력해주세요");
      return;
    }
    setSaving(true);
    try {
      await updateMeeting(meetingId, {
        title: editForm.title,
        content: editForm.content || undefined,
        meetingDate: meetingDate || undefined,
        startTime: editForm.startTime || undefined,
        endTime: editForm.endTime || undefined,
        location: editForm.location || undefined,
        attendees: editForm.attendees || undefined,
      });
      setEditing(false);
      await fetchMeeting(false);
    } catch (error) {
      Alert.alert("오류", "수정에 실패했습니다");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("회의 삭제", "이 회의를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMeeting(meetingId);
            navigation.goBack();
          } catch (error) {
            Alert.alert("오류", "회의 삭제에 실패했습니다");
          }
        },
      },
    ]);
  };

  const fetchMeeting = async (showLoading: boolean = true) => {
    try {
      setError(false);
      if (showLoading) setLoading(true);
      const data = await getMeetingDetail(meetingId);
      setMeeting(data);
      setMeetingDate(data.meetingDate ? data.meetingDate.split("T")[0] : "");
      setEditForm({
        title: data.title || "",
        content: data.content || "",
        startTime: data.startTime || "",
        endTime: data.endTime || "",
        location: data.location || "",
        attendees:
          data.attendees ||
          data.participants?.map((p: any) => p.user.name).join(", ") ||
          "",
      });
    } catch (error) {
      if (__DEV__) console.log("[MeetingDetailScreen] fetch failed");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeeting();
  }, []);

  useEffect(() => {
    userStorage.getUserId().then(setMyId);
  }, []);

  // 새로고침
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMeeting(false);
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="회의 상세" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="회의 상세" onBack={() => navigation.goBack()} />
      </View>
    );
  }

  if (!meeting) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="회의 상세" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Text style={{ color: colors.text }}>회의를 찾을 수 없습니다</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="회의 상세"
        onBack={() => navigation.goBack()}
        rightElement={
          (meeting.createdBy as any)?.id === myId ? (
            editing ? (
              <TouchableOpacity onPress={handleSave} disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color={primary} />
                ) : (
                  <Text style={{ color: primary, fontWeight: "600" }}>
                    저장
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Text style={{ color: primary, fontWeight: "600" }}>편집</Text>
              </TouchableOpacity>
            )
          ) : undefined
        }
      />
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View
          style={[
            styles.section,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {meeting.project && (
            <View style={styles.projectTag}>
              <View
                style={[
                  styles.projectDot,
                  { backgroundColor: meeting.project.color || primary },
                ]}
              />
              <Text
                style={[styles.projectName, { color: colors.textSecondary }]}
              >
                {meeting.project?.name}
              </Text>
            </View>
          )}
          {editing ? (
            <>
              <TextInput
                style={[
                  styles.editInput,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
                value={editForm.title}
                onChangeText={(v) => setEditForm({ ...editForm, title: v })}
                placeholder="제목"
                placeholderTextColor={colors.textMuted}
              />
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
                  style={{
                    color: meetingDate ? colors.text : colors.textMuted,
                  }}
                >
                  📅 {meetingDate || "날짜 선택"}
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
                  value={editForm.startTime}
                  onChangeText={(v) =>
                    setEditForm({ ...editForm, startTime: v })
                  }
                  placeholder="시작 (HH:MM)"
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={{ color: colors.textMuted, marginHorizontal: 8 }}>
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
                  value={editForm.endTime}
                  onChangeText={(v) => setEditForm({ ...editForm, endTime: v })}
                  placeholder="종료 (HH:MM)"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <TextInput
                style={[
                  styles.editInput,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
                value={editForm.location}
                onChangeText={(v) => setEditForm({ ...editForm, location: v })}
                placeholder="장소"
                placeholderTextColor={colors.textMuted}
              />
              <TextInput
                style={[
                  styles.editInput,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
                value={editForm.attendees}
                onChangeText={(v) => setEditForm({ ...editForm, attendees: v })}
                placeholder="참석자"
                placeholderTextColor={colors.textMuted}
              />
              <TextInput
                style={[
                  styles.editTextArea,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
                value={editForm.content}
                onChangeText={(v) => setEditForm({ ...editForm, content: v })}
                placeholder="회의 내용"
                placeholderTextColor={colors.textMuted}
                multiline
              />
            </>
          ) : (
            <>
              <Text style={[styles.meetingTitle, { color: colors.text }]}>
                {meeting.title}
              </Text>
              <Text style={[styles.date, { color: colors.textSecondary }]}>
                📅 {formatDate(meeting.meetingDate)}
              </Text>
              {meeting.startTime && (
                <Text style={[styles.time, { color: colors.textSecondary }]}>
                  🕐 {meeting.startTime}
                  {meeting.endTime ? ` ~ ${meeting.endTime}` : ""}
                </Text>
              )}
              {meeting.location && (
                <Text
                  style={[styles.location, { color: colors.textSecondary }]}
                >
                  📍 {meeting.location}
                </Text>
              )}
              {meeting.attendees && (
                <Text
                  style={[styles.location, { color: colors.textSecondary }]}
                >
                  👥 {meeting.attendees}
                </Text>
              )}
            </>
          )}
        </View>

        {/* 회의 내용 - 편집 모드 아닐 때만 */}
        {!editing && meeting.content && (
          <View
            style={[
              styles.section,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              회의 내용
            </Text>
            <Text style={[styles.content2, { color: colors.textSecondary }]}>
              {meeting.content}
            </Text>
          </View>
        )}

        {editing && (meeting.createdBy as any)?.id === myId && (
          <TouchableOpacity
            style={[styles.deleteButton, { borderColor: "#ef4444" }]}
            onPress={handleDelete}
          >
            <Text style={{ color: "#ef4444", fontWeight: "600" }}>
              회의 삭제
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { flex: 1 },
  section: { padding: 16, marginBottom: 8, borderWidth: 1 },
  projectTag: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  projectDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  projectName: { fontSize: 12 },
  meetingTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  date: { fontSize: 14, marginBottom: 6 },
  time: { fontSize: 14, marginBottom: 6 },
  location: { fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  content2: { fontSize: 14, lineHeight: 22 },
  editInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 8,
  },
  editTextArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 8,
  },
  datePicker: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 8 },
  timeRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  deleteButton: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
});
