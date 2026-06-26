import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUnreadCount } from "../api/notifications";
import { getUnreadCount as getMessageUnreadCount } from "../api/messages";
import { useSocket } from "./useSocket";
import { usePolling } from "./usePolling";
import { getRoomsUnreadTotal } from "../api/rooms";

interface BadgeContextType {
  notificationCount: number;
  messageCount: number;
  refresh: () => void;
}

const BadgeContext = createContext<BadgeContextType>({
  notificationCount: 0,
  messageCount: 0,
  refresh: () => {},
});

export const BadgeProvider = ({ children }: { children: ReactNode }) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      setIsLoggedIn(!!token);
    };
    checkLogin();
  }, []);

  const fetchCounts = async () => {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) {
      setIsLoggedIn(false);
      return;
    }
    try {
      const [notiRes, msgRes, roomUnread] = await Promise.all([
        getUnreadCount(),
        getMessageUnreadCount(),
        getRoomsUnreadTotal(),
      ]);
      setNotificationCount(notiRes.count || 0);
      setMessageCount((msgRes.count || 0) + roomUnread); // 쪽지 + 채팅 합산
    } catch (error) {
      // 오류 무시
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchCounts();
  }, [isLoggedIn]);

  useSocket("notification", () => fetchCounts(), [isLoggedIn]);
  useSocket("directMessage", () => fetchCounts(), [isLoggedIn]);
  useSocket("globalRoomMessage", () => fetchCounts(), [isLoggedIn]);

  usePolling(fetchCounts, 60000, isLoggedIn);

  return (
    <BadgeContext.Provider
      value={{ notificationCount, messageCount, refresh: fetchCounts }}
    >
      {children}
    </BadgeContext.Provider>
  );
};

export const useBadge = () => useContext(BadgeContext);
