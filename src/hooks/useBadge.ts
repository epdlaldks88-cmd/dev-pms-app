import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUnreadCount } from "../api/notifications";
import { getUnreadCount as getMessageUnreadCount } from "../api/messages";
import { useSocket } from "./useSocket";
import { usePolling } from "./usePolling";

export const useBadge = () => {
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
      const [notiRes, msgRes] = await Promise.all([
        getUnreadCount(),
        getMessageUnreadCount(),
      ]);
      setNotificationCount(notiRes.count || 0);
      setMessageCount(msgRes.count || 0);
    } catch (error) {
      // 오류 무시
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchCounts();
  }, [isLoggedIn]);

  // WebSocket으로 실시간 알림 수신 시 카운트 갱신
  useSocket(
    "notification",
    () => {
      fetchCounts();
    },
    [isLoggedIn],
  );

  // WebSocket으로 실시간 쪽지 수신 시 카운트 갱신
  useSocket(
    "directMessage",
    () => {
      fetchCounts();
    },
    [isLoggedIn],
  );

  // SSE 알림도 유지 (fallback)
  // useSSE('/notifications/events', () => {
  //   fetchCounts();
  // }, isLoggedIn);

  // 60초 폴링 (fallback)
  usePolling(fetchCounts, 60000, isLoggedIn);

  return { notificationCount, messageCount };
};
