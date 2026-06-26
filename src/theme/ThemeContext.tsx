import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { THEMES, ThemeKey, DARK_COLORS, LIGHT_COLORS } from "./colors";

type DarkMode = "system" | "light" | "dark";

interface ThemeContextType {
  themeKey: ThemeKey;
  isDark: boolean;
  darkMode: DarkMode;
  colors: typeof LIGHT_COLORS;
  primary: string;
  theme: typeof THEMES.red;
  setThemeKey: (key: ThemeKey) => void;
  setDarkMode: (mode: DarkMode) => void;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [themeKey, setThemeKeyState] = useState<ThemeKey>("red");
  const [darkMode, setDarkModeState] = useState<DarkMode>("system");

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem("themeKey");
      const savedDarkMode = await AsyncStorage.getItem("darkMode");
      if (savedTheme) setThemeKeyState(savedTheme as ThemeKey);
      if (savedDarkMode) {
        setDarkModeState(savedDarkMode as DarkMode);
      } else {
        // 기존 isDark 설정 마이그레이션
        const oldDark = await AsyncStorage.getItem("isDark");
        if (oldDark) setDarkModeState(oldDark === "true" ? "dark" : "light");
      }
    };
    loadTheme();
  }, []);

  const setThemeKey = async (key: ThemeKey) => {
    setThemeKeyState(key);
    await AsyncStorage.setItem("themeKey", key);
  };

  const setDarkMode = async (mode: DarkMode) => {
    setDarkModeState(mode);
    await AsyncStorage.setItem("darkMode", mode);
  };

  // 실제 다크 여부 계산
  const isDark =
    darkMode === "system" ? systemScheme === "dark" : darkMode === "dark";

  console.log(
    "darkMode:",
    darkMode,
    "systemScheme:",
    systemScheme,
    "isDark:",
    isDark,
  );

  // 기존 toggleDark는 시스템 무시하고 light/dark 토글
  const toggleDark = () => {
    setDarkMode(isDark ? "light" : "dark");
  };

  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
  const theme = THEMES[themeKey];

  return (
    <ThemeContext.Provider
      value={{
        themeKey,
        isDark,
        darkMode,
        colors,
        primary: theme.primary,
        theme,
        setThemeKey,
        setDarkMode,
        toggleDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
