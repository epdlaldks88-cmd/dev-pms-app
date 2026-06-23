import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { getProjects } from "../api/projects";

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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>프로젝트</Text>
      </View>

      {projects.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>프로젝트가 없습니다</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item}>
              <View style={styles.itemLeft}>
                <View
                  style={[styles.colorDot, { backgroundColor: item.color }]}
                />
                <View style={styles.itemContent}>
                  <Text style={styles.projectName}>{item.name}</Text>
                  {item.description && (
                    <Text style={styles.description} numberOfLines={1}>
                      {item.description}
                    </Text>
                  )}
                  <Text style={styles.memberCount}>
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
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 16,
    paddingTop: 56,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  list: {
    padding: 16,
  },
  item: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 12,
    color: "#94a3b8",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 16,
    color: "#94a3b8",
  },
});
