import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { search } from "../api/search";
import { useTheme } from "../theme/ThemeContext";

interface SearchResult {
  tasks: {
    id: string;
    title: string;
    status: string;
    project: { name: string; color: string };
  }[];
  projects: { id: string; name: string; status: string; color: string }[];
}

export default function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { primary, colors } = useTheme();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await search(query.trim());
      setResults(data);
    } catch (error) {
      console.log("검색 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      TODO: "할일",
      IN_PROGRESS: "진행중",
      IN_REVIEW: "검토중",
      DONE: "완료",
      CANCELLED: "취소",
      ACTIVE: "진행중",
      COMPLETED: "완료",
      ARCHIVED: "보관",
      ON_HOLD: "보류",
    };
    return labels[status] || status;
  };

  const totalCount =
    (results?.tasks?.length || 0) + (results?.projects?.length || 0);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* 헤더 */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>검색</Text>
        </View>

        {/* 검색 입력 */}
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
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
            placeholder="태스크, 프로젝트 검색..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: primary }]}
            onPress={handleSearch}
          >
            <Text style={styles.searchButtonText}>검색</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={primary} />
          </View>
        ) : results === null ? (
          <View style={styles.center}>
            <Text style={[styles.hintText, { color: colors.textMuted }]}>
              검색어를 입력하세요
            </Text>
          </View>
        ) : totalCount === 0 ? (
          <View style={styles.center}>
            <Text style={[styles.hintText, { color: colors.textMuted }]}>
              검색 결과가 없습니다
            </Text>
          </View>
        ) : (
          <FlatList
            data={[
              ...(results.projects?.length > 0
                ? [
                    {
                      type: "header",
                      title: `프로젝트 (${results.projects.length})`,
                      id: "ph",
                    },
                  ]
                : []),
              ...(results.projects || []).map((p) => ({
                ...p,
                type: "project",
              })),
              ...(results.tasks?.length > 0
                ? [
                    {
                      type: "header",
                      title: `태스크 (${results.tasks.length})`,
                      id: "th",
                    },
                  ]
                : []),
              ...(results.tasks || []).map((t) => ({ ...t, type: "task" })),
            ]}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }: any) => {
              if (item.type === "header") {
                return (
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {item.title}
                  </Text>
                );
              }
              if (item.type === "project") {
                return (
                  <TouchableOpacity
                    style={[
                      styles.item,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() =>
                      navigation.navigate("ProjectDetail", {
                        projectId: item.id,
                      })
                    }
                  >
                    <View
                      style={[styles.colorDot, { backgroundColor: item.color }]}
                    />
                    <View style={styles.itemContent}>
                      <Text style={[styles.itemTitle, { color: colors.text }]}>
                        {item.name}
                      </Text>
                      <Text
                        style={[styles.itemSub, { color: colors.textMuted }]}
                      >
                        {getStatusLabel(item.status)}
                      </Text>
                    </View>
                    <Text style={[styles.itemType, { color: primary }]}>
                      프로젝트
                    </Text>
                  </TouchableOpacity>
                );
              }
              if (item.type === "task") {
                return (
                  <TouchableOpacity
                    style={[
                      styles.item,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() =>
                      navigation.navigate("TaskDetail", { taskId: item.id })
                    }
                  >
                    <View
                      style={[
                        styles.colorDot,
                        { backgroundColor: item.project?.color || primary },
                      ]}
                    />
                    <View style={styles.itemContent}>
                      <Text style={[styles.itemTitle, { color: colors.text }]}>
                        {item.title}
                      </Text>
                      <Text
                        style={[styles.itemSub, { color: colors.textMuted }]}
                      >
                        {item.project?.name} · {getStatusLabel(item.status)}
                      </Text>
                    </View>
                    <Text style={[styles.itemType, { color: primary }]}>
                      태스크
                    </Text>
                  </TouchableOpacity>
                );
              }
              return null;
            }}
          />
        )}
      </View>
    </KeyboardAvoidingView>
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
  searchBox: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  searchButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  searchButtonText: { color: "#fff", fontWeight: "bold" },
  list: { padding: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  colorDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  itemSub: { fontSize: 12 },
  itemType: { fontSize: 12, fontWeight: "600" },
  hintText: { fontSize: 16 },
});
