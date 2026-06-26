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
      Alert.alert("알림", "이메일과 비밀번호를 입력해주세요");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigation.replace("MainTab");
    } catch (error: any) {
      let message = "로그인에 실패했습니다";

      if (!error?.response) {
        // 네트워크 에러 (서버 응답 없음)
        message = "서버에 연결할 수 없습니다.\n인터넷 연결을 확인해주세요";
      } else if (error.response.status === 401) {
        message = "이메일 또는 비밀번호가 올바르지 않습니다";
      } else if (error.response.status === 404) {
        message = "존재하지 않는 계정입니다";
      } else if (error.response.status === 429) {
        message = "로그인 시도가 너무 많습니다.\n잠시 후 다시 시도해주세요";
      } else if (error.response.status >= 500) {
        message =
          "서버에 일시적인 문제가 발생했습니다.\n잠시 후 다시 시도해주세요";
      } else {
        // 백엔드가 보낸 메시지 사용 (배열일 수도 있음)
        const serverMsg = error.response.data?.message;
        if (Array.isArray(serverMsg)) {
          message = serverMsg[0];
        } else if (typeof serverMsg === "string") {
          message = serverMsg;
        }
      }

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
