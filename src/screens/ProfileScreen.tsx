import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import { getMyProfile, updateProfile } from "../api/users";
import { logout } from "../api/auth";
import { useTheme } from "../theme/ThemeContext";
import { THEMES, ThemeKey } from "../theme/colors";
import Header from "../components/Header";

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
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    position: "",
    department: "",
    phone: "",
  });
  const {
    primary,
    isDark,
    darkMode,
    colors,
    themeKey,
    setThemeKey,
    setDarkMode,
  } = useTheme();

  const fetchProfile = async () => {
    try {
      const data = await getMyProfile();
      setUser(data);
      setForm({
        name: data.name || "",
        position: data.position || "",
        department: data.department || "",
        phone: data.phone || "",
      });
    } catch (error) {
      if (__DEV__) console.log("[ProfileScreen] fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert("오류", "이름은 필수입니다");
      return;
    }
    setSaving(true);
    try {
      await updateProfile(form);
      await fetchProfile();
      setEditing(false);
      Alert.alert("완료", "프로필이 수정됐습니다");
    } catch (error) {
      Alert.alert("오류", "프로필 수정에 실패했습니다");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("로그아웃", "로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          try {
            await logout(); // ⭐ 인자 없음 (내부에서 FCM 토큰 처리)
          } catch {
            // 무시 — 로컬 정리는 logout 안에서 이미 함
          }
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
      <Header
        title="마이페이지"
        rightElement={
          <TouchableOpacity
            onPress={() => (editing ? handleSave() : setEditing(true))}
          >
            {saving ? (
              <ActivityIndicator size="small" color={primary} />
            ) : (
              <Text style={{ color: primary, fontWeight: "600" }}>
                {editing ? "저장" : "편집"}
              </Text>
            )}
          </TouchableOpacity>
        }
      />

      {/* 아바타 */}
      <View style={[styles.avatarSection, { backgroundColor: colors.surface }]}>
        <View style={[styles.avatar, { backgroundColor: primary }]}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || "?"}</Text>
        </View>
        {editing ? (
          <TextInput
            style={[
              styles.nameInput,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
            value={form.name}
            onChangeText={(v) => setForm({ ...form, name: v })}
            placeholder="이름"
            placeholderTextColor={colors.textMuted}
          />
        ) : (
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.name}
          </Text>
        )}
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
      <View
        style={[
          styles.infoSection,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {editing ? (
          <>
            <View
              style={[styles.infoRow, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                부서
              </Text>
              <TextInput
                style={[styles.infoInput, { color: colors.text }]}
                value={form.department}
                onChangeText={(v) => setForm({ ...form, department: v })}
                placeholder="부서 입력"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View
              style={[styles.infoRow, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                직책
              </Text>
              <TextInput
                style={[styles.infoInput, { color: colors.text }]}
                value={form.position}
                onChangeText={(v) => setForm({ ...form, position: v })}
                placeholder="직책 입력"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View
              style={[styles.infoRow, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                연락처
              </Text>
              <TextInput
                style={[styles.infoInput, { color: colors.text }]}
                value={form.phone}
                onChangeText={(v) => setForm({ ...form, phone: v })}
                placeholder="연락처 입력"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
              />
            </View>
          </>
        ) : (
          <>
            <View
              style={[styles.infoRow, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                부서
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {user?.department || "-"}
              </Text>
            </View>
            <View
              style={[styles.infoRow, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                직책
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {user?.position || "-"}
              </Text>
            </View>
            <View
              style={[styles.infoRow, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                연락처
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {user?.phone || "-"}
              </Text>
            </View>
          </>
        )}
      </View>

      {editing && (
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: colors.border }]}
          onPress={() => {
            setEditing(false);
            setForm({
              name: user?.name || "",
              position: user?.position || "",
              department: user?.department || "",
              phone: user?.phone || "",
            });
          }}
        >
          <Text
            style={[styles.cancelButtonText, { color: colors.textSecondary }]}
          >
            취소
          </Text>
        </TouchableOpacity>
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
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          화면 모드
        </Text>
        <View style={styles.darkModeRow2}>
          {[
            { key: "system", label: "시스템" },
            { key: "light", label: "라이트" },
            { key: "dark", label: "다크" },
          ].map((mode) => (
            <TouchableOpacity
              key={mode.key}
              style={[
                styles.darkModeButton,
                { borderColor: colors.border },
                darkMode === mode.key && {
                  backgroundColor: primary,
                  borderColor: primary,
                },
              ]}
              onPress={() => setDarkMode(mode.key as any)}
            >
              <Text
                style={[
                  styles.darkModeButtonText,
                  {
                    color:
                      darkMode === mode.key ? "#fff" : colors.textSecondary,
                  },
                ]}
              >
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
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
  editButton: { fontSize: 16, fontWeight: "600" },
  avatarSection: { alignItems: "center", padding: 32, marginBottom: 8 },
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
  nameInput: {
    fontSize: 20,
    fontWeight: "bold",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
    textAlign: "center",
    minWidth: 150,
  },
  email: { fontSize: 14, marginBottom: 8 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  roleText: { fontSize: 12, fontWeight: "600" },
  infoSection: {
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 12,
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
  infoInput: { fontSize: 14, flex: 1, textAlign: "right" },
  cancelButton: {
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 12,
  },
  cancelButtonText: { fontSize: 15, fontWeight: "600" },
  section: {
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  themeRow: { flexDirection: "row", gap: 12, marginBottom: 8 },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  themeButtonActive: { borderWidth: 3, borderColor: "#fff", elevation: 4 },
  themeCheck: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  themeLabels: { flexDirection: "row", gap: 12 },
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
  darkModeRow2: { flexDirection: "row", gap: 8 },
  darkModeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  darkModeButtonText: { fontSize: 14, fontWeight: "600" },
});
