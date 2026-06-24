import { useState, useEffect } from "react";
import { getUnreadCount } from "../api/notifications";
import { getUnreadCount as getMessageUnreadCount } from "../api/messages";
import { usePolling } from "./usePolling";

export const useBadge = () => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  const fetchCounts = async () => {
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
    fetchCounts();
  }, []);

  usePolling(fetchCounts, 10000); // 10초마다 갱신

  return { notificationCount, messageCount };
};
