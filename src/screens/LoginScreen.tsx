import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { login } from "../api/auth";
import { useTheme } from "../theme/ThemeContext";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { primary, colors } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("오류", "이메일과 비밀번호를 입력해주세요");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigation.replace("MainTab");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        JSON.stringify(error);
      Alert.alert("로그인 실패", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: primary }]}>PMS</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          프로젝트 관리 시스템
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              color: "#000000",
              borderColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
          placeholder="이메일"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={[
            styles.input,
            {
              color: "#000000",
              borderColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
          placeholder="비밀번호"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          style={[styles.button, { backgroundColor: primary }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>로그인</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
