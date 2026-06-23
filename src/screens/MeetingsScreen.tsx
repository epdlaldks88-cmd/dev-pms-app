import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { getMeetings } from "../api/meetings";

interface Meeting {
  id: string;
  title: string;
  content?: string;
  meetingDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  project?: { name: string; color: string };
  participants: any[];
}

export default function MeetingsScreen() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMeetings = async () => {
    try {
      const data = await getMeetings();
      setMeetings(data);
    } catch (error) {
      console.log("회의 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMeetings();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
  };

  const formatDay = (dateString: string) => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return days[new Date(dateString).getDay()];
  };

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const isPast = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>회의</Text>
        <Text style={styles.headerCount}>{meetings.length}개</Text>
      </View>

      {meetings.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>회의가 없습니다</Text>
        </View>
      ) : (
        <FlatList
          data={meetings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.item, isPast(item.meetingDate) && styles.pastItem]}
            >
              <View style={styles.dateBox}>
                <Text style={styles.dateDay}>
                  {formatDay(item.meetingDate)}
                </Text>
                <Text style={styles.dateNum}>
                  {new Date(item.meetingDate).getDate()}
                </Text>
                {isToday(item.meetingDate) && <View style={styles.todayDot} />}
              </View>
              <View style={styles.divider} />
              <View style={styles.itemContent}>
                <View style={styles.itemTop}>
                  <Text style={styles.meetingTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {isToday(item.meetingDate) && (
                    <View style={styles.todayBadge}>
                      <Text style={styles.todayText}>오늘</Text>
                    </View>
                  )}
                </View>
                {item.project && (
                  <View style={styles.projectTag}>
                    <View
                      style={[
                        styles.projectDot,
                        { backgroundColor: item.project.color || "#6366f1" },
                      ]}
                    />
                    <Text style={styles.projectName}>{item.project.name}</Text>
                  </View>
                )}
                <View style={styles.itemBottom}>
                  {item.startTime && (
                    <Text style={styles.time}>
                      🕐 {item.startTime}
                      {item.endTime ? ` ~ ${item.endTime}` : ""}
                    </Text>
                  )}
                  {item.location && (
                    <Text style={styles.location}>📍 {item.location}</Text>
                  )}
                  <Text style={styles.participants}>
                    👥 {item.participants?.length || 0}명
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 56,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  headerCount: {
    fontSize: 14,
    color: "#94a3b8",
  },
  list: {
    padding: 16,
  },
  item: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
  },
  pastItem: {
    opacity: 0.6,
  },
  dateBox: {
    alignItems: "center",
    width: 36,
  },
  dateDay: {
    fontSize: 11,
    color: "#94a3b8",
    marginBottom: 2,
  },
  dateNum: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#6366f1",
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: "100%",
    backgroundColor: "#e2e8f0",
    marginHorizontal: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  meetingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },
  todayBadge: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  todayText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
  projectTag: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  projectDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  projectName: {
    fontSize: 12,
    color: "#64748b",
  },
  itemBottom: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  time: {
    fontSize: 12,
    color: "#64748b",
  },
  location: {
    fontSize: 12,
    color: "#64748b",
  },
  participants: {
    fontSize: 12,
    color: "#64748b",
  },
  emptyText: {
    fontSize: 16,
    color: "#94a3b8",
  },
});
