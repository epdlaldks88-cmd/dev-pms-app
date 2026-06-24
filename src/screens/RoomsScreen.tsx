import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { getMyRooms, createRoom } from "../api/rooms";
import { getAllUsers } from "../api/users";
import { useTheme } from "../theme/ThemeContext";

interface Room {
  id: string;
  name: string;
  members: { user: { id: string; name: string } }[];
  messages: { content: string; createdAt: string }[];
}

export default function RoomsScreen({ navigation }: any) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { primary, colors } = useTheme();

  const fetchRooms = async () => {
    try {
      const data = await getMyRooms();
      setRooms(data);
    } catch (error) {
      console.log("채팅방 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.log("유저 조회 실패:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRooms();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchRooms();
    fetchUsers();
  }, []);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert("오류", "채팅방 이름을 입력해주세요");
      return;
    }
    try {
      await createRoom(roomName.trim(), selectedUsers);
      setShowCreate(false);
      setRoomName("");
      setSelectedUsers([]);
      await fetchRooms();
    } catch (error) {
      Alert.alert("오류", "채팅방 생성에 실패했습니다");
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>채팅방</Text>
        <TouchableOpacity onPress={() => setShowCreate(true)}>
          <Text style={[styles.newButton, { color: primary }]}>
            + 새 채팅방
          </Text>
        </TouchableOpacity>
      </View>

      {rooms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            채팅방이 없습니다
          </Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
                  {item.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.itemContent}>
                <View style={styles.itemTop}>
                  <Text style={[styles.roomName, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  {item.messages?.length > 0 && (
                    <Text style={[styles.time, { color: colors.textMuted }]}>
                      {formatDate(
                        item.messages[item.messages.length - 1].createdAt,
                      )}
                    </Text>
                  )}
                </View>
                <Text style={[styles.memberCount, { color: colors.textMuted }]}>
                  멤버 {item.members?.length || 0}명
                </Text>
                {item.messages?.length > 0 && (
                  <Text
                    style={[
                      styles.lastMessage,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={1}
                  >
                    {item.messages[item.messages.length - 1].content}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

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
                style={[styles.modalButton, { backgroundColor: primary }]}
                onPress={handleCreateRoom}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                  생성
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
  newButton: { fontSize: 14, fontWeight: "600" },
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
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16 },
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
});
