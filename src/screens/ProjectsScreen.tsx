import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { getProjects } from "../api/projects";
import { useTheme } from "../theme/ThemeContext";

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

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { primary, colors } = useTheme();

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.log("프로젝트 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProjects();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

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
    const colors: Record<string, string> = {
      ACTIVE: "#22c55e",
      COMPLETED: "#6366f1",
      ARCHIVED: "#94a3b8",
      ON_HOLD: "#f59e0b",
    };
    return colors[status] || "#94a3b8";
  };

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
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          프로젝트
        </Text>
      </View>

      {projects.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            프로젝트가 없습니다
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.item,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
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
                  <Text
                    style={[styles.memberCount, { color: colors.textMuted }]}
                  >
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
      )}
    </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400,
  },
  emptyText: { fontSize: 16 },
});
