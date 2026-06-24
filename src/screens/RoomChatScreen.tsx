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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getRoomMessages, sendRoomMessage, leaveRoom } from "../api/rooms";
import { useTheme } from "../theme/ThemeContext";
import { usePolling } from "../hooks/usePolling";

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
  usePolling(() => {
    if (!loading) fetchMessages();
  }, 3000);

  useEffect(() => {
    const init = async () => {
      const id = await AsyncStorage.getItem("userId");
      setMyId(id);
      await fetchMessages();
    };
    init();
  }, []);

  const fetchMessages = async () => {
    try {
      const data = await getRoomMessages(roomId);
      setMessages(data.messages || []);
    } catch (error) {
      console.log("메시지 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
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
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
            paddingTop: 56,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: primary }]}>← 뒤로</Text>
          </TouchableOpacity>
          <Text
            style={[styles.headerTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {roomName}
          </Text>
          <TouchableOpacity onPress={handleLeave}>
            <Text style={[styles.leaveButton, { color: "#ef4444" }]}>
              나가기
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
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
                      {formatDate(item.createdAt)}
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
                        {item.sender.name.charAt(0)}
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
                        {item.sender.name}
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
});
