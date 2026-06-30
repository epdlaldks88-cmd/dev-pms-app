import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { tokenStorage } from "../lib/storage";
import { getUnreadCount } from "../api/notifications";
import { getUnreadCount as getMessageUnreadCount } from "../api/messages";
import { useSocket, onSocketReconnect } from "./useSocket";
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
      const token = await tokenStorage.getAccessToken();
      setIsLoggedIn(!!token);
    };
    checkLogin();
  }, []);

  const fetchCounts = async () => {
    const token = await tokenStorage.getAccessToken();
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
      setMessageCount((msgRes.count || 0) + roomUnread);
    } catch (error) {
      if (__DEV__) console.log("[useBadge] fetchCounts failed");
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchCounts();
  }, [isLoggedIn]);

  useSocket("notification", () => fetchCounts(), [isLoggedIn]);
  useSocket("directMessage", () => fetchCounts(), [isLoggedIn]);
  useSocket("globalRoomMessage", () => fetchCounts(), [isLoggedIn]);

  // ⭐ 소켓 재연결 시 catch-up (끊긴 동안 놓친 이벤트 보정)
  useEffect(() => {
    if (!isLoggedIn) return;
    return onSocketReconnect(() => {
      fetchCounts();
    });
  }, [isLoggedIn]);

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
