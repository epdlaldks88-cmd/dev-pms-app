import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { getAllUsers } from "../api/users";
import { useTheme } from "../theme/ThemeContext";
import { EmptyState } from "../components/EmptyState";
import { ErrorView } from "../components/ErrorView";
import { SkeletonList } from "../components/SkeletonItem";
import Header from "../components/Header";

interface User {
  id: string;
  name: string;
  email: string;
  department?: string;
  position?: string;
}

export default function NewMessageScreen({
  navigation,
  showHeader = true,
}: any) {
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { primary, colors } = useTheme();
  const [error, setError] = useState(false);

  // fetchUsers 정리
  const fetchUsers = async (showLoading: boolean = true) => {
    try {
      setError(false);
      if (showLoading) setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
      setFiltered(data);
    } catch (e) {
      if (__DEV__) console.log("[NewMessage] fetchUsers failed");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(users);
    } else {
      setFiltered(
        users.filter(
          (u) => u.name.includes(search) || u.email.includes(search),
        ),
      );
    }
  }, [search, users]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {showHeader && (
          <Header title="새 쪽지" onBack={() => navigation.goBack()} />
        )}
        <View style={styles.center}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      </View>
    );
  }

  // 변경 후
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {showHeader && <Header title="새 쪽지" />}
        <ErrorView onRetry={() => fetchUsers()} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showHeader && (
        <Header title="새 쪽지" onBack={() => navigation.goBack()} />
      )}
      <View
        style={[
          styles.searchBox,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TextInput
          style={[
            styles.searchInput,
            {
              color: colors.text,
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
          placeholder="이름 또는 이메일 검색..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          filtered.length === 0 ? { flexGrow: 1 } : undefined
        }
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title={search.trim() ? "검색 결과가 없습니다" : "사용자가 없습니다"}
            description={
              search.trim()
                ? `"${search}"에 해당하는 사용자가 없어요.`
                : undefined
            }
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
              navigation.replace("MessageThread", {
                userId: item.id,
                userName: item.name,
              })
            }
          >
            <View style={[styles.avatar, { backgroundColor: primary }]}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={styles.itemContent}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.userInfo, { color: colors.textMuted }]}>
                {item.department || ""} {item.position || ""} {item.email}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchBox: { padding: 12, borderBottomWidth: 1 },
  searchInput: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14 },
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
  userName: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  userInfo: { fontSize: 12 },
});
