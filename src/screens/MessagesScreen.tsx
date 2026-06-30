import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { getConversations } from "../api/messages";
import { useTheme } from "../theme/ThemeContext";
import { formatDate } from "../utils/date";
import { EmptyState } from "../components/EmptyState";
import { ErrorView } from "../components/ErrorView";
import { SkeletonList } from "../components/SkeletonItem";
import Header from "../components/Header";

interface Conversation {
  user: { id: string; name: string; email: string };
  lastMessage: {
    content: string;
    createdAt: string;
    isRead: boolean;
    senderId: string;
  };
  unreadCount: number;
}

export default function MessagesScreen({ navigation, showHeader = true }: any) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { primary, colors } = useTheme();
  const [error, setError] = useState(false);

  const fetchConversations = async (showLoading: boolean = true) => {
    try {
      setError(false);
      if (showLoading) setLoading(true);
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      if (__DEV__) console.log("[MessagesScreen] fetch failed");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchConversations(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchConversations();
  }, []);

  if (loading) {
    return (
      <View style={[{ flex: 1 }, { backgroundColor: colors.background }]}>
        {showHeader && <Header title="쪽지" />}
        <SkeletonList count={5} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {showHeader && <Header title="쪽지" />}
        <ErrorView onRetry={() => fetchConversations()} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showHeader && <Header title="쪽지" />} {/* ⭐ 추가 */}
      <View
        style={[
          styles.actionBar,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.navigate("NewMessage")}>
          <Text style={[styles.newButton, { color: primary }]}>+ 새 쪽지</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.user.id}
        contentContainerStyle={
          conversations.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          <EmptyState
            icon="chatbubble-outline"
            title="쪽지가 없습니다"
            description="아직 주고받은 쪽지가 없어요"
            actionLabel="새 쪽지 보내기"
            onAction={() => navigation.navigate("NewMessage")}
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
              {
                backgroundColor: colors.surface,
                borderBottomColor: colors.border,
              },
            ]}
            onPress={() =>
              navigation.navigate("MessageThread", {
                userId: item.user.id,
                userName: item.user.name,
              })
            }
          >
            <View style={[styles.avatar, { backgroundColor: primary }]}>
              <Text style={styles.avatarText}>
                {item.user?.name?.charAt(0) || "?"}
              </Text>
            </View>
            <View style={styles.itemContent}>
              <View style={styles.itemTop}>
                <Text style={[styles.userName, { color: colors.text }]}>
                  {item.user?.name}
                </Text>
                <Text style={[styles.time, { color: colors.textMuted }]}>
                  {item.lastMessage
                    ? formatDate(item.lastMessage.createdAt)
                    : ""}
                </Text>
              </View>
              <View style={styles.itemBottom}>
                <Text
                  style={[
                    styles.lastMessage,
                    {
                      color:
                        item.unreadCount > 0
                          ? colors.text
                          : colors.textSecondary,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.lastMessage?.content || ""}
                </Text>
                {item.unreadCount > 0 && (
                  <View style={[styles.badge, { backgroundColor: primary }]}>
                    <Text style={styles.badgeText}>{item.unreadCount}</Text>
                  </View>
                )}
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
  newButton: { fontSize: 14, fontWeight: "600" },
  item: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  itemContent: { flex: 1 },
  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  userName: { fontSize: 15, fontWeight: "600" },
  time: { fontSize: 12 },
  itemBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: { fontSize: 14, flex: 1 },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  emptyContainer: { flexGrow: 1 },
  emptyText: { fontSize: 16 },
  actionBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 12,
    borderBottomWidth: 1,
  },
  list: { padding: 16 },
});
