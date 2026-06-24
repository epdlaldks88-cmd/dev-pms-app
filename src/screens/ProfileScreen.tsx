import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
} from "react-native";
import { getMyProfile } from "../api/users";
import { logout } from "../api/auth";
import { useTheme } from "../theme/ThemeContext";
import { THEMES, ThemeKey } from "../theme/colors";

interface User {
  id: string;
  name: string;
  email: string;
  position?: string;
  department?: string;
  phone?: string;
  role: string;
}

export default function ProfileScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { primary, isDark, colors, themeKey, setThemeKey, toggleDark } =
    useTheme();

  const fetchProfile = async () => {
    try {
      const data = await getMyProfile();
      setUser(data);
    } catch (error) {
      console.log("프로필 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert("로그아웃", "로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await logout();
          navigation.replace("Login");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* 헤더 */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          마이페이지
        </Text>
      </View>

      {/* 프로필 */}
      <View style={[styles.avatarSection, { backgroundColor: colors.surface }]}>
        <View style={[styles.avatar, { backgroundColor: primary }]}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || "?"}</Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>
          {user?.email}
        </Text>
        <View style={[styles.roleBadge, { backgroundColor: primary + "20" }]}>
          <Text style={[styles.roleText, { color: primary }]}>
            {user?.role === "ADMIN" ? "관리자" : "멤버"}
          </Text>
        </View>
      </View>

      {/* 정보 */}
      {(user?.department || user?.position || user?.phone) && (
        <View
          style={[
            styles.infoSection,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {user?.department && (
            <View
              style={[styles.infoRow, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                부서
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {user.department}
              </Text>
            </View>
          )}
          {user?.position && (
            <View
              style={[styles.infoRow, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                직책
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {user.position}
              </Text>
            </View>
          )}
          {user?.phone && (
            <View
              style={[styles.infoRow, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                연락처
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {user.phone}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* 테마 색상 */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          테마 색상
        </Text>
        <View style={styles.themeRow}>
          {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.themeButton,
                { backgroundColor: THEMES[key].primary },
                themeKey === key && styles.themeButtonActive,
              ]}
              onPress={() => setThemeKey(key)}
            >
              {themeKey === key && <Text style={styles.themeCheck}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.themeLabels}>
          {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
            <Text
              key={key}
              style={[
                styles.themeLabel,
                { color: themeKey === key ? primary : colors.textMuted },
              ]}
            >
              {THEMES[key].name}
            </Text>
          ))}
        </View>
      </View>

      {/* 다크모드 */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.darkModeRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            다크모드
          </Text>
          <Switch
            value={isDark}
            onValueChange={toggleDark}
            trackColor={{ false: colors.border, true: primary + "80" }}
            thumbColor={isDark ? primary : colors.textMuted}
          />
        </View>
      </View>

      {/* 로그아웃 */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    padding: 16,
    paddingTop: 56,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  avatarSection: {
    alignItems: "center",
    padding: 32,
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: "bold", color: "#fff" },
  name: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  email: { fontSize: 14, marginBottom: 8 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  roleText: { fontSize: 12, fontWeight: "600" },
  infoSection: {
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: "500" },
  section: {
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  themeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  themeButtonActive: {
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  themeCheck: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  themeLabels: {
    flexDirection: "row",
    gap: 12,
  },
  themeLabel: { width: 40, fontSize: 11, textAlign: "center" },
  darkModeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
