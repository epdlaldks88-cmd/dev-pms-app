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
import { getThread, sendMessage } from "../api/messages";
import { useTheme } from "../theme/ThemeContext";
import { usePolling } from "../hooks/usePolling";
import { Keyboard } from "react-native";
import {
  formatDate,
  formatDateLabel,
  formatTime,
  formatRelative,
} from "../utils/date";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: { id: string; name: string };
  recipient: { id: string; name: string };
  isRead: boolean;
}

export default function MessageThreadScreen({ route, navigation }: any) {
  const { userId, userName } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
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
      const data = await getThread(userId);
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
    Keyboard.dismiss();
    try {
      await sendMessage(userId, message.trim());
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
          <View style={[styles.headerAvatar, { backgroundColor: primary }]}>
            <Text style={styles.headerAvatarText}>{userName.charAt(0)}</Text>
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {userName}
          </Text>
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
                        {item.sender.name.charAt(0)}
                      </Text>
                    </View>
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
                    <Text
                      style={[
                        styles.bubbleTime,
                        { color: isMine ? "#ffffff80" : colors.textMuted },
                      ]}
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
  backButton: { fontSize: 16, marginRight: 12 },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  headerAvatarText: { color: "#fff", fontWeight: "bold" },
  headerTitle: { fontSize: 16, fontWeight: "bold" },
  messageList: { padding: 16 },
  messageRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
  },
  messageRowMine: { flexDirection: "row-reverse" },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  bubble: { maxWidth: "70%", padding: 10, borderRadius: 12 },
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
  dateDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dateLine: { flex: 1, height: 1 },
  dateText: { fontSize: 12, paddingHorizontal: 8 },
});
