import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../theme/ThemeContext";

export default function NoticeDetailScreen({ route, navigation }: any) {
  const { notice } = route.params;
  const { primary, colors } = useTheme();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
          paddingTop: 56,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: primary }]}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          공지사항
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        <View
          style={[
            styles.section,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.tags}>
            {notice.isPinned && (
              <View
                style={[
                  styles.pinnedBadge,
                  { backgroundColor: primary + "20" },
                ]}
              >
                <Text style={[styles.pinnedText, { color: primary }]}>
                  📌 고정
                </Text>
              </View>
            )}
            {notice.project && (
              <View
                style={[
                  styles.projectTag,
                  { backgroundColor: notice.project.color + "20" },
                ]}
              >
                <Text
                  style={[styles.projectText, { color: notice.project.color }]}
                >
                  {notice.project.name}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {notice.title}
          </Text>
          <View style={styles.meta}>
            <Text style={[styles.author, { color: colors.textSecondary }]}>
              {notice.createdBy?.name}
            </Text>
            <Text style={[styles.date, { color: colors.textMuted }]}>
              {formatDate(notice.createdAt)}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.contentSection,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.contentText, { color: colors.text }]}>
            {notice.content}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { fontSize: 16, width: 60 },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  content: { flex: 1 },
  section: { padding: 16, marginBottom: 8, borderWidth: 1 },
  tags: { flexDirection: "row", gap: 6, marginBottom: 12 },
  pinnedBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  pinnedText: { fontSize: 12, fontWeight: "600" },
  projectTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  projectText: { fontSize: 12, fontWeight: "600" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  meta: { flexDirection: "row", justifyContent: "space-between" },
  author: { fontSize: 13 },
  date: { fontSize: 13 },
  contentSection: { padding: 16, borderWidth: 1 },
  contentText: { fontSize: 15, lineHeight: 24 },
});
