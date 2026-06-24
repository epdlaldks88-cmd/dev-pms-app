import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { THEMES, ThemeKey, DARK_COLORS, LIGHT_COLORS } from "./colors";

interface ThemeContextType {
  themeKey: ThemeKey;
  isDark: boolean;
  colors: typeof LIGHT_COLORS;
  primary: string;
  theme: typeof THEMES.red;
  setThemeKey: (key: ThemeKey) => void;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeKey, setThemeKeyState] = useState<ThemeKey>("red");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem("themeKey");
      const savedDark = await AsyncStorage.getItem("isDark");
      if (savedTheme) setThemeKeyState(savedTheme as ThemeKey);
      if (savedDark) setIsDark(savedDark === "true");
    };
    loadTheme();
  }, []);

  const setThemeKey = async (key: ThemeKey) => {
    setThemeKeyState(key);
    await AsyncStorage.setItem("themeKey", key);
  };

  const toggleDark = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem("isDark", String(next));
  };

  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
  const theme = THEMES[themeKey];

  return (
    <ThemeContext.Provider
      value={{
        themeKey,
        isDark,
        colors,
        primary: theme.primary,
        theme,
        setThemeKey,
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
