import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../api/notifications";
import { useTheme } from "../theme/ThemeContext";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { primary, colors } = useTheme();

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.log("알림 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.log("읽음 처리 실패:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.log("전체 읽음 처리 실패:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>알림</Text>
        {notifications.some((n) => !n.isRead) && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={[styles.markAllRead, { color: primary }]}>
              모두 읽음
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            알림이 없습니다
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
              onPress={() => handleMarkAsRead(item.id)}
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
                <View
                  style={[styles.unreadDot, { backgroundColor: primary }]}
                />
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 56,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  markAllRead: { fontSize: 14 },
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400,
  },
  emptyText: { fontSize: 16 },
});
