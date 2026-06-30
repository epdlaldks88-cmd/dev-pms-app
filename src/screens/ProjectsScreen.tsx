import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { getProjects } from "../api/projects";
import { useTheme } from "../theme/ThemeContext";
import { useFocusEffect } from "@react-navigation/native";
import Header from "../components/Header";
import { EmptyState } from "../components/EmptyState";
import { ErrorView } from "../components/ErrorView";
import { SkeletonList } from "../components/SkeletonItem";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  color: string;
  startDate?: string;
  endDate?: string;
  members: any[];
}

export default function ProjectsScreen({ navigation, showHeader = true }: any) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { primary, colors } = useTheme();
  const [error, setError] = useState(false);

  const fetchProjects = async (showLoading: boolean = true) => {
    try {
      setError(false);
      if (showLoading) setLoading(true);
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      if (__DEV__) console.log("ProjectsScreen fetch failed"); // [] 빠짐
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProjects(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProjects(projects.length === 0); // items는 각 화면의 데이터 state명
    }, [projects.length]),
  );

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: "진행중",
      COMPLETED: "완료",
      ARCHIVED: "보관",
      ON_HOLD: "보류",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const c: Record<string, string> = {
      // ⭐ c로 변경
      ACTIVE: "#22c55e",
      COMPLETED: "#6366f1",
      ARCHIVED: "#94a3b8",
      ON_HOLD: "#f59e0b",
    };
    return c[status] || "#94a3b8";
  };

  if (loading) {
    return (
      <View style={[{ flex: 1 }, { backgroundColor: colors.background }]}>
        {showHeader && <Header title="프로젝트" />}
        <SkeletonList count={5} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {showHeader && <Header title="프로젝트" />}
        <ErrorView onRetry={() => fetchProjects()} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showHeader && <Header title="프로젝트" />}

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          projects.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          <EmptyState
            icon="folder-outline"
            title="프로젝트가 없습니다"
            description="아직 참여 중인 프로젝트가 없어요"
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.item,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() =>
              navigation.navigate("ProjectDetail", { projectId: item.id })
            }
          >
            <View style={styles.itemLeft}>
              <View
                style={[styles.colorDot, { backgroundColor: item.color }]}
              />
              <View style={styles.itemContent}>
                <Text style={[styles.projectName, { color: colors.text }]}>
                  {item.name}
                </Text>
                {item.description && (
                  <Text
                    style={[
                      styles.description,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={1}
                  >
                    {item.description}
                  </Text>
                )}
                <Text style={[styles.memberCount, { color: colors.textMuted }]}>
                  멤버 {item.members?.length || 0}명
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(item.status) },
                ]}
              >
                {getStatusLabel(item.status)}
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
  list: { padding: 16 },
  item: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  itemContent: { flex: 1 },
  projectName: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
  description: { fontSize: 13, marginBottom: 4 },
  memberCount: { fontSize: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: "600" },
  emptyContainer: { flexGrow: 1, padding: 16 },
});
