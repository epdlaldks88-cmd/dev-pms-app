import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUnreadCount } from "../api/notifications";
import { getUnreadCount as getMessageUnreadCount } from "../api/messages";
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

  usePolling(fetchCounts, 10000, isLoggedIn);

  return { notificationCount, messageCount };
};
