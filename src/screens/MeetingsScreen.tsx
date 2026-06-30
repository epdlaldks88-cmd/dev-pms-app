import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { getMeetings } from "../api/meetings";
import { useTheme } from "../theme/ThemeContext";
import { useFocusEffect } from "@react-navigation/native";
import Header from "../components/Header";
import { EmptyState } from "../components/EmptyState";
import { ErrorView } from "../components/ErrorView";
import { SkeletonList } from "../components/SkeletonItem";

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

export default function MeetingsScreen({ navigation, showHeader = true }: any) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { primary, colors } = useTheme();
  const [error, setError] = useState(false);

  const fetchMeetings = async (showLoading: boolean = true) => {
    try {
      setError(false);
      if (showLoading) setLoading(true);
      const data = await getMeetings();
      setMeetings(data);
    } catch (error) {
      if (__DEV__) console.log("[MeetingsScreen] fetch failed");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMeetings(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMeetings(meetings.length === 0); // items는 각 화면의 데이터 state명
    }, [meetings.length]),
  );

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

  const isPast = (dateString: string) => new Date(dateString) < new Date();

  if (loading) {
    return (
      <View style={[{ flex: 1 }, { backgroundColor: colors.background }]}>
        {showHeader && <Header title="회의" />}
        <SkeletonList count={5} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {showHeader && <Header title="회의" />}
        <ErrorView onRetry={() => fetchMeetings()} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showHeader && (
        <Header
          title="회의"
          rightElement={
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>
              {meetings.length}개
            </Text>
          }
        />
      )}
      <FlatList
        data={meetings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          meetings.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="회의가 없습니다"
            description="예정된 회의가 없어요"
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.item,
              { backgroundColor: colors.surface, borderColor: colors.border },
              isPast(item.meetingDate) && styles.pastItem,
            ]}
            onPress={() =>
              navigation.navigate("MeetingDetail", { meetingId: item.id })
            }
          >
            <View style={styles.dateBox}>
              <Text style={[styles.dateDay, { color: colors.textMuted }]}>
                {formatDay(item.meetingDate)}
              </Text>
              <Text style={[styles.dateNum, { color: colors.text }]}>
                {new Date(item.meetingDate).getDate()}
              </Text>
              {isToday(item.meetingDate) && (
                <View style={[styles.todayDot, { backgroundColor: primary }]} />
              )}
            </View>
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <View style={styles.itemContent}>
              <View style={styles.itemTop}>
                <Text
                  style={[styles.meetingTitle, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                {isToday(item.meetingDate) && (
                  <View
                    style={[styles.todayBadge, { backgroundColor: primary }]}
                  >
                    <Text style={styles.todayText}>오늘</Text>
                  </View>
                )}
              </View>
              {item.project && (
                <View style={styles.projectTag}>
                  <View
                    style={[
                      styles.projectDot,
                      { backgroundColor: item.project.color || primary },
                    ]}
                  />
                  <Text
                    style={[
                      styles.projectName,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {item.project?.name}
                  </Text>
                </View>
              )}
              <View style={styles.itemBottom}>
                {item.startTime && (
                  <Text style={[styles.time, { color: colors.textSecondary }]}>
                    🕐 {item.startTime}
                    {item.endTime ? ` ~ ${item.endTime}` : ""}
                  </Text>
                )}
                {item.location && (
                  <Text
                    style={[styles.location, { color: colors.textSecondary }]}
                  >
                    📍 {item.location}
                  </Text>
                )}
                <Text
                  style={[styles.participants, { color: colors.textSecondary }]}
                >
                  👥 {item.participants?.length || 0}명
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  item: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  pastItem: { opacity: 0.6 },
  dateBox: { alignItems: "center", width: 36 },
  dateDay: { fontSize: 11, marginBottom: 2 },
  dateNum: { fontSize: 20, fontWeight: "bold" },
  todayDot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },
  divider: { width: 1, height: "100%", marginHorizontal: 12 },
  itemContent: { flex: 1 },
  itemTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  meetingTitle: { fontSize: 15, fontWeight: "600", flex: 1 },
  todayBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  todayText: { fontSize: 11, color: "#fff", fontWeight: "600" },
  projectTag: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  projectDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  projectName: { fontSize: 12 },
  itemBottom: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  time: { fontSize: 12 },
  location: { fontSize: 12 },
  participants: { fontSize: 12 },
  emptyContainer: { flexGrow: 1, padding: 16 },
});
