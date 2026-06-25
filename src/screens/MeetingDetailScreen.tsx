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
import { useTheme } from "../theme/ThemeContext";
import {
  formatDate,
  formatDateLabel,
  formatTime,
  formatRelative,
} from "../utils/date";
import Header from "../components/Header";

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

  const fetchMeeting = async () => {
    try {
      const data = await getMeetingDetail(meetingId);
      console.log("회의 데이터:", JSON.stringify(data).slice(0, 500));
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

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  if (!meeting) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>회의를 찾을 수 없습니다</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="회의 상세" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.content}>
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
                {meeting.project.name}
              </Text>
            </View>
          )}
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
            <Text style={[styles.location, { color: colors.textSecondary }]}>
              📍 {meeting.location}
            </Text>
          )}
        </View>

        {/* 참석자 */}
        {meeting.attendees && (
          <View
            style={[
              styles.section,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              참석자
            </Text>
            <Text style={[styles.content2, { color: colors.textSecondary }]}>
              {meeting.attendees}
            </Text>
          </View>
        )}

        {meeting.participants?.length > 0 && (
          <View
            style={[
              styles.section,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              참석자 ({meeting.participants.length}명)
            </Text>
            <View style={styles.participantsRow}>
              {meeting.participants.map((p) => (
                <View key={p.user.id} style={styles.participant}>
                  <View style={[styles.avatar, { backgroundColor: primary }]}>
                    <Text style={styles.avatarText}>
                      {p.user.name.charAt(0)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.participantName,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {p.user.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {meeting.content && (
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

        <View
          style={[
            styles.section,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.createdBy, { color: colors.textMuted }]}>
            작성자: {meeting.createdBy?.name}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  participantsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  participant: { alignItems: "center" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  participantName: { fontSize: 12 },
  content2: { fontSize: 14, lineHeight: 22 },
  createdBy: { fontSize: 13 },
});
