import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { getMyRooms, createRoom } from "../api/rooms";
import { getAllUsers } from "../api/users";
import { useTheme } from "../theme/ThemeContext";
import { EmptyState } from "../components/EmptyState";
import { ErrorView } from "../components/ErrorView";
import { SkeletonList } from "../components/SkeletonItem";
import { useFocusEffect } from "@react-navigation/native";
import { useSocket } from "../hooks/useSocket";
import Header from "../components/Header";

interface Room {
  id: string;
  name: string;
  members: { user: { id: string; name: string } }[];
  messages: { content: string; createdAt: string }[];
  lastMessage?: { content: string; createdAt: string };
  unreadCount?: number;
}

export default function RoomsScreen({ navigation, showHeader = true }: any) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { primary, colors } = useTheme();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(false);

  const fetchRooms = async (showLoading: boolean = true) => {
    try {
      setError(false);
      if (showLoading) setLoading(true);
      const data = await getMyRooms();
      setRooms(data);
    } catch (e) {
      if (__DEV__) console.log("[RoomsScreen] fetchRooms failed");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (e) {
      if (__DEV__) console.log("[RoomsScreen] fetchUsers failed");
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRooms(false);
    setRefreshing(false);
  }, []);

  // useFocusEffect가 마운트 시점에도 실행되므로 useEffect의 fetchRooms 중복 제거
  useEffect(() => {
    fetchUsers();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRooms(rooms.length === 0);
    }, [rooms.length]),
  );

  useSocket(
    "globalRoomMessage",
    () => {
      fetchRooms(false);
    },
    [],
  );

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert("오류", "채팅방 이름을 입력해주세요");
      return;
    }
    if (creating) return;
    setCreating(true);
    try {
      await createRoom(roomName.trim(), selectedUsers);
      setShowCreate(false);
      setRoomName("");
      setSelectedUsers([]);
      await fetchRooms(false);
    } catch (e) {
      Alert.alert("오류", "채팅방 생성에 실패했습니다");
    } finally {
      setCreating(false);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "방금";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  // === 로딩 (스켈레톤 + Header) ===
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {showHeader && <Header title="채팅방" />}
        <SkeletonList count={5} />
      </View>
    );
  }

  // === 에러 (Header 유지) ===
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {showHeader && <Header title="채팅방" />}
        <ErrorView onRetry={() => fetchRooms()} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showHeader && <Header title="채팅방" />}

      <View
        style={[
          styles.actionBar,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={() => setShowCreate(true)}>
          <Text style={[styles.newButton, { color: primary }]}>
            + 새 채팅방
          </Text>
        </TouchableOpacity>
      </View>

      {/* ListEmptyComponent 일원화 */}
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          rooms.length === 0 ? styles.emptyContainer : undefined
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="참여중인 채팅방이 없습니다"
            description="새 채팅방을 만들어 동료와 대화를 시작해보세요."
            actionLabel="채팅방 만들기"
            onAction={() => setShowCreate(true)}
          />
        }
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
              navigation.navigate("RoomChat", {
                roomId: item.id,
                roomName: item.name,
              })
            }
          >
            <View
              style={[styles.roomIcon, { backgroundColor: primary + "20" }]}
            >
              <Text style={[styles.roomIconText, { color: primary }]}>
                {item.name?.charAt(0) || "?"}
              </Text>
            </View>
            <View style={styles.itemContent}>
              <View style={styles.itemTop}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <Text
                    style={[styles.roomName, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  {(item.unreadCount ?? 0) > 0 && (
                    <View
                      style={[styles.unreadBadge, { backgroundColor: primary }]}
                    >
                      <Text style={styles.unreadBadgeText}>
                        {(item.unreadCount ?? 0) > 99
                          ? "99+"
                          : item.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
                {item.lastMessage && (
                  <Text style={[styles.time, { color: colors.textMuted }]}>
                    {formatDate(item.lastMessage.createdAt)}
                  </Text>
                )}
              </View>
              <Text style={[styles.memberCount, { color: colors.textMuted }]}>
                {`멤버 ${item.members?.length || 0}명`}
              </Text>
              {item.lastMessage && (
                <Text
                  style={[styles.lastMessage, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {item.lastMessage.content}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      {/* 채팅방 생성 모달 */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              새 채팅방
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="채팅방 이름"
              placeholderTextColor={colors.textMuted}
              value={roomName}
              onChangeText={setRoomName}
            />
            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
              멤버 선택
            </Text>
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 200 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.userItem,
                    { borderBottomColor: colors.border },
                  ]}
                  onPress={() => toggleUser(item.id)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      { borderColor: primary },
                      selectedUsers.includes(item.id) && {
                        backgroundColor: primary,
                      },
                    ]}
                  >
                    {selectedUsers.includes(item.id) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <Text style={[styles.userName, { color: colors.text }]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { borderColor: colors.border, borderWidth: 1 },
                ]}
                onPress={() => {
                  setShowCreate(false);
                  setRoomName("");
                  setSelectedUsers([]);
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  취소
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: primary },
                  creating && { opacity: 0.6 },
                ]}
                onPress={handleCreateRoom}
                disabled={creating}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                  {creating ? "생성 중..." : "생성"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  item: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  roomIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  roomIconText: { fontSize: 18, fontWeight: "bold" },
  itemContent: { flex: 1 },
  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  roomName: { fontSize: 15, fontWeight: "600" },
  time: { fontSize: 12 },
  memberCount: { fontSize: 12, marginBottom: 2 },
  lastMessage: { fontSize: 13 },
  emptyContainer: { flexGrow: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000080",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  modalLabel: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkmark: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  userName: { fontSize: 14 },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 16 },
  modalButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: "center" },
  modalButtonText: { fontSize: 15, fontWeight: "600" },
  actionBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 12,
    borderBottomWidth: 1,
  },
  newButton: { fontSize: 14, fontWeight: "600" },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  unreadBadgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
});
