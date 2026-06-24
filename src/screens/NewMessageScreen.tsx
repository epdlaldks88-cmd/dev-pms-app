import React, { useState, useEffect } from "react";
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

interface User {
  id: string;
  name: string;
  email: string;
  department?: string;
  position?: string;
}

export default function NewMessageScreen({ navigation }: any) {
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { primary, colors } = useTheme();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
        setFiltered(data);
      } catch (error) {
        console.log("유저 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };
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
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  return (
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          새 쪽지
        </Text>
      </View>

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
  backButton: { fontSize: 16, marginRight: 12 },
  headerTitle: { fontSize: 16, fontWeight: "bold" },
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
