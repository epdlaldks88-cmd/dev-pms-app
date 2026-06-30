import React, { Component, ReactNode } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  componentStack: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, componentStack: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ componentStack: errorInfo.componentStack ?? null });

    if (__DEV__) {
      console.log("[ErrorBoundary] caught:", error);
      console.log("[ErrorBoundary] stack:", errorInfo.componentStack);
    }

    // 추후 GlitchTip/Sentry 도입 시 여기에 captureException 추가
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, componentStack: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>일시적인 오류가 발생했습니다</Text>
          <Text style={styles.subtitle}>
            잠시 후 다시 시도해주세요.{"\n"}
            문제가 계속되면 관리자에게 문의해주세요.
          </Text>

          {__DEV__ && this.state.error && (
            <View style={styles.devBox}>
              <Text style={styles.devTitle}>DEV — 에러 정보</Text>
              <Text style={styles.devText}>{this.state.error.toString()}</Text>
              {this.state.componentStack && (
                <>
                  <Text style={[styles.devTitle, { marginTop: 12 }]}>
                    Component Stack
                  </Text>
                  <Text style={styles.devText}>
                    {this.state.componentStack}
                  </Text>
                </>
              )}
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>다시 시도</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  icon: { fontSize: 48, marginBottom: 16 },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    minWidth: 200,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  devBox: {
    width: "100%",
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#fbbf24",
  },
  devTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400e",
    marginBottom: 6,
  },
  devText: {
    fontSize: 11,
    color: "#78350f",
    fontFamily: "monospace",
  },
});
