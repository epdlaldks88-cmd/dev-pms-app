import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { getMeetingDetail } from "../api/meetings";

interface Meeting {
  id: string;
  title: string;
  content?: string;
  meetingDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  attendees?: string;
  project?: { name: string; color: string };
  participants: { user: { id: string; name: string } }[];
  createdBy: { name: string };
}

export default function MeetingDetailScreen({ route, navigation }: any) {
  const { meetingId } = route.params;
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMeeting = async () => {
    try {
      const data = await getMeetingDetail(meetingId);
      setMeeting(data);
    } catch (error) {
      console.log("회의 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeeting();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} (${days[date.getDay()]})`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!meeting) {
    return (
      <View style={styles.center}>
        <Text>회의를 찾을 수 없습니다</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          회의 상세
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* 기본 정보 */}
        <View style={styles.section}>
          {meeting.project && (
            <View style={styles.projectTag}>
              <View
                style={[
                  styles.projectDot,
                  { backgroundColor: meeting.project.color || "#6366f1" },
                ]}
              />
              <Text style={styles.projectName}>{meeting.project.name}</Text>
            </View>
          )}
          <Text style={styles.meetingTitle}>{meeting.title}</Text>
          <Text style={styles.date}>📅 {formatDate(meeting.meetingDate)}</Text>
          {meeting.startTime && (
            <Text style={styles.time}>
              🕐 {meeting.startTime}
              {meeting.endTime ? ` ~ ${meeting.endTime}` : ""}
            </Text>
          )}
          {meeting.location && (
            <Text style={styles.location}>📍 {meeting.location}</Text>
          )}
        </View>

        {/* 참석자 */}
        {meeting.participants?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              참석자 ({meeting.participants.length}명)
            </Text>
            <View style={styles.participantsRow}>
              {meeting.participants.map((p) => (
                <View key={p.user.id} style={styles.participant}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {p.user.name.charAt(0)}
                    </Text>
                  </View>
                  <Text style={styles.participantName}>{p.user.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 회의 내용 */}
        {meeting.content && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>회의 내용</Text>
            <Text style={styles.content2}>{meeting.content}</Text>
          </View>
        )}

        {/* 작성자 */}
        <View style={styles.section}>
          <Text style={styles.createdBy}>
            작성자: {meeting.createdBy?.name}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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
    paddingTop: 56,
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
  meetingTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 12,
  },
  date: { fontSize: 14, color: "#374151", marginBottom: 6 },
  time: { fontSize: 14, color: "#374151", marginBottom: 6 },
  location: { fontSize: 14, color: "#374151" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  participantsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  participant: { alignItems: "center" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  participantName: { fontSize: 12, color: "#374151" },
  content2: { fontSize: 14, color: "#374151", lineHeight: 22 },
  createdBy: { fontSize: 13, color: "#94a3b8" },
});
