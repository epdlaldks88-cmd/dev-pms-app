import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { getWbsItems, updateWbsItem, deleteWbsItem } from "../api/wbs";
import { getProjects } from "../api/projects";
import { useTheme } from "../theme/ThemeContext";
import { useFocusEffect } from "@react-navigation/native";
import ErrorView from "../components/ErrorView";
import EmptyState from "../components/EmptyState";
import Header from "../components/Header";
import { SkeletonList } from "../components/SkeletonItem";
import { formatDate } from "../utils/date";

interface WbsItem {
  id: string;
  title: string;
  assignee?: string;
  startDate?: string;
  endDate?: string;
  progress: number;
  status: string;
  note?: string;
  depth: number;
  order: number;
  project?: { id: string; name: string; color: string };
}

const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "시작 전",
  IN_PROGRESS: "진행 중",
  DONE: "완료",
  ON_HOLD: "보류",
};

const STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: "#94a3b8",
  IN_PROGRESS: "#6366f1",
  DONE: "#22c55e",
  ON_HOLD: "#f59e0b",
};

export default function WbsScreen({ navigation, showHeader = true }: any) {
  const [items, setItems] = useState<WbsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WbsItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { primary, colors } = useTheme();

  const fetchItems = async () => {
    try {
      setError(false);
      const projects = await getProjects();
      const wbsPromises = projects.map((project: any) =>
        getWbsItems(project.id)
          .then((data: any[]) =>
            data.map((item: any) => ({
              ...item,
              project: {
                id: project.id,
                name: project.name,
                color: project.color,
              },
            })),
          )
          .catch(() => []),
      );
      const wbsArrays = await Promise.all(wbsPromises);
      const allItems = wbsArrays
        .flat()
        .sort((a: any, b: any) => a.order - b.order);
      setItems(allItems);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetch = async () => {
        setLoading(true);
        await fetchItems();
      };
      fetch();
    }, []),
  );

  const handleUpdateProgress = async (item: WbsItem, progress: number) => {
    try {
      await updateWbsItem(item.project!.id, item.id, { progress });
      await fetchItems();
    } catch (e) {
      Alert.alert("오류", "진행률 수정에 실패했습니다");
    }
  };

  const handleUpdateStatus = async (item: WbsItem, status: string) => {
    try {
      await updateWbsItem(item.project!.id, item.id, { status });
      await fetchItems();
      setShowModal(false);
    } catch (e) {
      Alert.alert("오류", "상태 변경에 실패했습니다");
    }
  };

  const showStatusPicker = (item: WbsItem) => {
    Alert.alert("상태 변경", "변경할 상태를 선택해주세요", [
      {
        text: "시작 전",
        onPress: () => handleUpdateStatus(item, "NOT_STARTED"),
      },
      {
        text: "진행 중",
        onPress: () => handleUpdateStatus(item, "IN_PROGRESS"),
      },
      { text: "완료", onPress: () => handleUpdateStatus(item, "DONE") },
      { text: "보류", onPress: () => handleUpdateStatus(item, "ON_HOLD") },
      { text: "취소", style: "cancel" },
    ]);
  };

  const getDday = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const diff = Math.ceil(
      (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff === 0) return "D-Day";
    if (diff > 0) return `D-${diff}`;
    return `D+${Math.abs(diff)}`;
  };

  if (loading) {
    return (
      <View style={[{ flex: 1 }, { backgroundColor: colors.background }]}>
        {showHeader && <Header title="WBS" />}
        <SkeletonList count={5} />
      </View>
    );
  }

  if (error) {
    return <ErrorView onRetry={fetchItems} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showHeader && <Header title="WBS" />}

      {items.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <EmptyState
            icon="📋"
            title="WBS 항목이 없습니다"
            description="프로젝트에 WBS 항목을 추가해주세요"
          />
        </ScrollView>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => {
            const dday = getDday(item.endDate);
            const isOverdue =
              item.endDate &&
              new Date(item.endDate) < new Date() &&
              item.status !== "DONE";
            return (
              <View
                style={[
                  styles.item,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                  { marginLeft: item.depth * 16 },
                ]}
              >
                <View style={styles.itemTop}>
                  <View style={styles.leftInfo}>
                    {item.project && (
                      <View
                        style={[
                          styles.projectTag,
                          { backgroundColor: item.project.color + "20" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.projectText,
                            { color: item.project.color },
                          ]}
                        >
                          {item.project.name}
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={[
                        styles.statusBadge,
                        { backgroundColor: STATUS_COLORS[item.status] + "20" },
                      ]}
                      onPress={() => showStatusPicker(item)}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: STATUS_COLORS[item.status] },
                        ]}
                      >
                        {STATUS_LABELS[item.status]} ▼
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {dday && (
                    <Text
                      style={[
                        styles.dday,
                        { color: isOverdue ? "#ef4444" : colors.textMuted },
                      ]}
                    >
                      {dday}
                    </Text>
                  )}
                </View>

                <Text style={[styles.title, { color: colors.text }]}>
                  {item.title}
                </Text>

                {item.assignee && (
                  <Text
                    style={[styles.assignee, { color: colors.textSecondary }]}
                  >
                    👤 {item.assignee}
                  </Text>
                )}

                {(item.startDate || item.endDate) && (
                  <Text style={[styles.date, { color: colors.textMuted }]}>
                    📅 {item.startDate ? formatDate(item.startDate) : "미정"} ~{" "}
                    {item.endDate ? formatDate(item.endDate) : "미정"}
                  </Text>
                )}

                {/* 진행률 바 */}
                <View style={styles.progressContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      { backgroundColor: colors.border },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${item.progress}%` as any,
                          backgroundColor: primary,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[styles.progressText, { color: colors.textMuted }]}
                  >
                    {item.progress}%
                  </Text>
                </View>

                {/* 진행률 조절 버튼 */}
                <View style={styles.progressButtons}>
                  {[0, 25, 50, 75, 100].map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.progressBtn,
                        { borderColor: colors.border },
                        item.progress === p && {
                          backgroundColor: primary,
                          borderColor: primary,
                        },
                      ]}
                      onPress={() => handleUpdateProgress(item, p)}
                    >
                      <Text
                        style={[
                          styles.progressBtnText,
                          {
                            color:
                              item.progress === p
                                ? "#fff"
                                : colors.textSecondary,
                          },
                        ]}
                      >
                        {p}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {item.note && (
                  <Text style={[styles.note, { color: colors.textMuted }]}>
                    {item.note}
                  </Text>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  item: { borderRadius: 8, padding: 16, marginBottom: 8, borderWidth: 1 },
  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  leftInfo: { flexDirection: "row", gap: 8, alignItems: "center", flex: 1 },
  projectTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  projectText: { fontSize: 12, fontWeight: "600" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: "600" },
  dday: { fontSize: 12, fontWeight: "600" },
  title: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  assignee: { fontSize: 13, marginBottom: 4 },
  date: { fontSize: 12, marginBottom: 8 },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  progressBar: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  progressText: { fontSize: 12, width: 36 },
  progressButtons: { flexDirection: "row", gap: 6, marginBottom: 4 },
  progressBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  progressBtnText: { fontSize: 11 },
  note: { fontSize: 12, marginTop: 4, fontStyle: "italic" },
});
