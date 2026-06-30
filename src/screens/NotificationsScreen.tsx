import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../api/notifications";
import { useTheme } from "../theme/ThemeContext";
import { useFocusEffect } from "@react-navigation/native";
import { formatDate } from "../utils/date";
import Header from "../components/Header";
import { ErrorView } from "../components/ErrorView";
import { SkeletonList } from "../components/SkeletonItem";
import { EmptyState } from "../components/EmptyState";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export default function NotificationsScreen({
  navigation,
  showHeader = true,
}: any) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { primary, colors } = useTheme();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [error, setError] = useState(false);

  const fetchNotifications = async (showLoading: boolean = true) => {
    try {
      setError(false);
      if (showLoading) setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      if (__DEV__) console.log("[NotificationsScreen] fetch failed");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications(false);
    setRefreshing(false);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      if (__DEV__) console.log("[Notifications] markAsRead failed");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      if (__DEV__) console.log("[Notifications] markAllAsRead failed");
    }
  };

  const handleNotificationPress = async (item: Notification) => {
    await handleMarkAsRead(item.id);

    if (!item.link) return;

    // 메시지/멘션 → 쪽지 스레드로 이동
    if (item.link.includes("/messages?to=")) {
      const userId = item.link.split("to=")[1]?.split("&")[0];
      if (userId) {
        navigation.navigate("MessageThread", { userId, userName: "쪽지" });
      }
      return;
    }

    // 태스크 관련
    if (item.link.includes("/tasks/")) {
      const taskId = item.link.split("/tasks/")[1];
      navigation.navigate("TaskDetail", { taskId });
      return;
    }

    // 프로젝트 관련
    if (item.link.includes("/projects/")) {
      const projectId = item.link.split("/projects/")[1];
      navigation.navigate("ProjectDetail", { projectId });
      return;
    }

    // 회의 관련
    if (item.link.includes("/meetings/")) {
      const meetingId = item.link.split("/meetings/")[1];
      navigation.navigate("MeetingDetail", { meetingId });
      return;
    }

    // 워크로그/기타 → 홈으로
    if (item.link.includes("/workload")) {
      navigation.navigate("MainTab", { screen: "Home" });
      return;
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications(notifications.length === 0); // items는 각 화면의 데이터 state명
    }, [notifications.length]),
  );

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      TASK_ASSIGNED: "태스크 배정",
      TASK_UPDATED: "태스크 업데이트",
      COMMENT_ADDED: "댓글",
      MENTION: "멘션",
      DUE_DATE_APPROACHING: "마감 임박",
      PROJECT_INVITATION: "프로젝트 초대",
    };
    return labels[type] || type;
  };

  const displayed = showUnreadOnly
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  if (loading) {
    return (
      <View style={[{ flex: 1 }, { backgroundColor: colors.background }]}>
        {showHeader && <Header title="알림" />}
        <SkeletonList count={5} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {showHeader && <Header title="알림" />}
        <ErrorView onRetry={() => fetchNotifications()} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showHeader && (
        <Header
          title="알림"
          rightElement={
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <TouchableOpacity
                onPress={() => setShowUnreadOnly(!showUnreadOnly)}
              >
                <Text
                  style={{
                    color: showUnreadOnly ? primary : colors.textMuted,
                    fontSize: 13,
                    fontWeight: "600",
                  }}
                >
                  {showUnreadOnly ? "● 안읽음" : "○ 전체"}
                </Text>
              </TouchableOpacity>
              {notifications.some((n) => !n.isRead) && (
                <TouchableOpacity onPress={handleMarkAllAsRead}>
                  <Text style={{ color: primary, fontSize: 14 }}>
                    모두 읽음
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      <FlatList
        data={displayed}
        contentContainerStyle={
          displayed.length === 0 ? styles.emptyContainer : styles.list // ⭐ displayed
        }
        ListEmptyComponent={
          <EmptyState
            icon="notifications-outline"
            title={
              showUnreadOnly ? "읽지 않은 알림이 없습니다" : "알림이 없습니다"
            }
            description={
              showUnreadOnly
                ? "모든 알림을 확인하셨어요."
                : "새로운 알림이 도착하면 여기에 표시됩니다."
            }
          />
        }
        keyExtractor={(item) => item.id}
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
              !item.isRead && {
                borderLeftWidth: 3,
                borderLeftColor: primary,
                backgroundColor: primary + "10",
              },
            ]}
            onPress={() => handleNotificationPress(item)}
          >
            <View style={styles.itemHeader}>
              <Text style={[styles.typeLabel, { color: primary }]}>
                {getTypeLabel(item.type)}
              </Text>
              <Text style={[styles.date, { color: colors.textMuted }]}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>
              {item.message}
            </Text>
            {!item.isRead && (
              <View style={[styles.unreadDot, { backgroundColor: primary }]} />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  item: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    position: "relative",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  typeLabel: { fontSize: 12, fontWeight: "600" },
  date: { fontSize: 12 },
  title: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  message: { fontSize: 14 },
  unreadDot: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyContainer: { flexGrow: 1, padding: 16 },
  list: { padding: 16 },
});
