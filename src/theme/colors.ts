export const THEMES = {
  red: {
    name: "레드",
    primary: "#e60012",
    primary50: "#fff0f0",
    primary100: "#ffe0e0",
    primary200: "#ffc0c0",
    primary500: "#e60012",
    primary600: "#cc000f",
    primary700: "#a8000c",
  },
  blue: {
    name: "블루",
    primary: "#3b82f6",
    primary50: "#eff6ff",
    primary100: "#dbeafe",
    primary200: "#bfdbfe",
    primary500: "#3b82f6",
    primary600: "#2563eb",
    primary700: "#1d4ed8",
  },
  green: {
    name: "그린",
    primary: "#22c55e",
    primary50: "#f0fdf4",
    primary100: "#dcfce7",
    primary200: "#bbf7d0",
    primary500: "#22c55e",
    primary600: "#16a34a",
    primary700: "#15803d",
  },
  purple: {
    name: "퍼플",
    primary: "#8b5cf6",
    primary50: "#f5f3ff",
    primary100: "#ede9fe",
    primary200: "#ddd6fe",
    primary500: "#8b5cf6",
    primary600: "#7c3aed",
    primary700: "#6d28d9",
  },
  orange: {
    name: "오렌지",
    primary: "#f97316",
    primary50: "#fff7ed",
    primary100: "#ffedd5",
    primary200: "#fed7aa",
    primary500: "#f97316",
    primary600: "#ea580c",
    primary700: "#c2410c",
  },
};

export type ThemeKey = keyof typeof THEMES;

export const DARK_COLORS = {
  background: "#111827",
  surface: "#1f2937",
  border: "#374151",
  text: "#f9fafb",
  textSecondary: "#9ca3af",
  textMuted: "#6b7280",
};

export const LIGHT_COLORS = {
  background: "#f8fafc",
  surface: "#ffffff",
  border: "#e2e8f0",
  text: "#111827",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
};
