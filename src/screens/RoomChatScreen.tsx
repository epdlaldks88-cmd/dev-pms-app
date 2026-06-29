import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../theme/ThemeContext";
import { useRoomSocket } from "../hooks/useSocket";
import {
  formatDate,
  formatDateLabel,
  formatTime,
  formatRelative,
} from "../utils/date";
import { Keyboard, KeyboardEvent } from "react-native";
import Header from "../components/Header";
import {
  getRoomMessages,
  sendRoomMessage,
  leaveRoom,
  renameRoom,
} from "../api/rooms";

interface RoomMessage {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: { id: string; name: string };
}

export default function RoomChatScreen({ route, navigation }: any) {
  const { roomId, roomName } = route.params;
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const { primary, colors } = useTheme();
  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [currentRoomName, setCurrentRoomName] = useState(roomName);

  useRoomSocket(
    roomId,
    () => {
      fetchMessages();
    },
    myId,
  ); // myId 추가

  useEffect(() => {
    const init = async () => {
      const id = await AsyncStorage.getItem("userId");
      setMyId(id);
      await fetchMessages();
    };
    init();
  }, []);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const willShowSubscription = Keyboard.addListener(
      "keyboardWillShow",
      () => {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
    );

    return () => {
      showSubscription.remove();
      willShowSubscription.remove();
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const data = await getRoomMessages(roomId);
      console.log("멤버 데이터:", JSON.stringify(data.room?.members));
      setMessages(data.messages || []);
      setMembers(data.room?.members || []);
    } catch (error) {
      console.log("메시지 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    Keyboard.dismiss();
    try {
      await sendRoomMessage(roomId, message.trim());
      setMessage("");
      await fetchMessages();
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    } catch (error) {
      Alert.alert("오류", "메시지 전송에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeave = () => {
    Alert.alert("채팅방 나가기", "정말 나가시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "나가기",
        style: "destructive",
        onPress: async () => {
          try {
            await leaveRoom(roomId);
            navigation.goBack();
          } catch (error) {
            Alert.alert("오류", "채팅방 나가기에 실패했습니다");
          }
        },
      },
    ]);
  };

  const handleRename = async () => {
    if (!newRoomName.trim()) {
      Alert.alert("오류", "채팅방 이름을 입력해주세요");
      return;
    }
    try {
      await renameRoom(roomId, newRoomName.trim());
      setCurrentRoomName(newRoomName.trim());
      setEditingName(false);
      navigation.setParams({ roomName: newRoomName.trim() });
    } catch (error) {
      Alert.alert("오류", "이름 변경에 실패했습니다");
    }
  };

  const shouldShowDate = (index: number) => {
    if (index === 0) return true;
    const current = new Date(messages[index].createdAt);
    const prev = new Date(messages[index - 1].createdAt);
    return current.toDateString() !== prev.toDateString();
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          title={currentRoomName}
          onBack={() => navigation.goBack()}
          rightElement={
            <TouchableOpacity onPress={() => setShowMembers(true)}>
              <Text style={{ color: primary, fontWeight: "600" }}>멤버</Text>
            </TouchableOpacity>
          }
        />

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          removeClippedSubviews={true}
          maxToRenderPerBatch={15}
          windowSize={10}
          initialNumToRender={15}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item, index }) => {
            const isMine = item.senderId === myId;
            return (
              <View>
                {shouldShowDate(index) && (
                  <View style={styles.dateDivider}>
                    <View
                      style={[
                        styles.dateLine,
                        { backgroundColor: colors.border },
                      ]}
                    />
                    <Text
                      style={[
                        styles.dateText,
                        {
                          color: colors.textMuted,
                          backgroundColor: colors.background,
                        },
                      ]}
                    >
                      {formatDateLabel(item.createdAt)}
                    </Text>
                    <View
                      style={[
                        styles.dateLine,
                        { backgroundColor: colors.border },
                      ]}
                    />
                  </View>
                )}
                <View
                  style={[styles.messageRow, isMine && styles.messageRowMine]}
                >
                  {!isMine && (
                    <View style={[styles.avatar, { backgroundColor: primary }]}>
                      <Text style={styles.avatarText}>
                        {item.sender?.name?.charAt(0) || "?"}
                      </Text>
                    </View>
                  )}
                  <View style={styles.bubbleWrapper}>
                    {!isMine && (
                      <Text
                        style={[
                          styles.senderName,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {item.sender?.name}
                      </Text>
                    )}
                    <View
                      style={[
                        styles.bubble,
                        isMine
                          ? { backgroundColor: primary }
                          : {
                              backgroundColor: colors.surface,
                              borderColor: colors.border,
                              borderWidth: 1,
                            },
                      ]}
                    >
                      <Text
                        style={[
                          styles.bubbleText,
                          { color: isMine ? "#fff" : colors.text },
                        ]}
                      >
                        {item.content}
                      </Text>
                    </View>
                    <Text
                      style={[styles.bubbleTime, { color: colors.textMuted }]}
                    >
                      {formatTime(item.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />

        <View
          style={[
            styles.inputRow,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + 12,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="메시지 입력..."
            placeholderTextColor={colors.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
            onFocus={() => {
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 300);
            }}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: primary },
              !message.trim() && { backgroundColor: primary + "60" },
            ]}
            onPress={handleSend}
            disabled={submitting || !message.trim()}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>전송</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 멤버 목록 모달 */}
        <Modal visible={showMembers} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View
              style={[styles.modalContent, { backgroundColor: colors.surface }]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  멤버 ({members.length}명)
                </Text>
                <TouchableOpacity onPress={() => setShowMembers(false)}>
                  <Text style={{ color: primary, fontSize: 16 }}>닫기</Text>
                </TouchableOpacity>
              </View>

              {/* 채팅방 이름 변경 */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={[styles.modalLabel, { color: colors.textSecondary }]}
                >
                  채팅방 이름
                </Text>
                {editingName ? (
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TextInput
                      style={[
                        styles.renameInput,
                        {
                          color: colors.text,
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                        },
                      ]}
                      value={newRoomName}
                      onChangeText={setNewRoomName}
                      placeholder="새 이름"
                      placeholderTextColor={colors.textMuted}
                      autoFocus
                    />
                    <TouchableOpacity
                      style={[
                        styles.renameButton,
                        { backgroundColor: primary },
                      ]}
                      onPress={handleRename}
                    >
                      <Text style={{ color: "#fff", fontWeight: "600" }}>
                        저장
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={[styles.roomNameText, { color: colors.text }]}>
                      {currentRoomName}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingName(true);
                        setNewRoomName(currentRoomName);
                      }}
                    >
                      <Text style={{ color: primary, fontWeight: "600" }}>
                        변경
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <ScrollView style={{ maxHeight: 300 }}>
                {members.map((item) => (
                  <View
                    key={item.userId}
                    style={[
                      styles.memberItem,
                      { borderBottomColor: colors.border },
                    ]}
                  >
                    <View
                      style={[
                        styles.memberAvatar,
                        { backgroundColor: primary },
                      ]}
                    >
                      <Text style={styles.memberAvatarText}>
                        {item?.user?.name?.charAt(0) || "?"}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.memberName, { color: colors.text }]}>
                        {item?.user?.name || "알 수 없음"}
                      </Text>
                      {item?.user?.position && (
                        <Text
                          style={[
                            styles.memberPosition,
                            { color: colors.textMuted },
                          ]}
                        >
                          {item.user.position}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={[styles.leaveButton2, { borderColor: "#ef4444" }]}
                onPress={() => {
                  setShowMembers(false);
                  handleLeave();
                }}
              >
                <Text style={{ color: "#ef4444", fontWeight: "600" }}>
                  채팅방 나가기
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
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
  leaveButton: { fontSize: 14, width: 60, textAlign: "right" },
  messageList: { padding: 16 },
  dateDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dateLine: { flex: 1, height: 1 },
  dateText: { fontSize: 12, paddingHorizontal: 8 },
  messageRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  messageRowMine: { flexDirection: "row-reverse" },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  bubbleWrapper: { maxWidth: "70%" },
  senderName: { fontSize: 12, marginBottom: 4 },
  bubble: { padding: 10, borderRadius: 12 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTime: { fontSize: 11, marginTop: 4, textAlign: "right" },
  inputRow: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  sendButtonText: { color: "#fff", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000080",
    justifyContent: "center", // flex-end → center
    padding: 20,
  },
  modalContent: {
    borderRadius: 16, // 상단만 둥글던 거 전체 둥글게
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memberAvatarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  memberName: { fontSize: 15, fontWeight: "600" },
  memberPosition: { fontSize: 12, marginTop: 2 },
  leaveButton2: {
    marginTop: 16,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  modalLabel: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  renameInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  renameButton: {
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
  },
  roomNameText: { fontSize: 16, fontWeight: "600" },
});
