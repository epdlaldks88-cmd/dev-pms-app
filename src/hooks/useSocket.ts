import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const SOCKET_URL = "https://dev-pms-backend-production.up.railway.app";

let globalSocket: Socket | null = null;

export const getSocket = async (): Promise<Socket> => {
  if (globalSocket?.connected) return globalSocket;

  const token = await AsyncStorage.getItem("accessToken");

  globalSocket = io(`${SOCKET_URL}/chat`, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  return globalSocket;
};

export const disconnectSocket = () => {
  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
  }
};

export const useSocket = (
  event: string,
  handler: (data: any) => void,
  deps: any[] = [],
) => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    let socket: Socket | null = null;

    const connect = async () => {
      socket = await getSocket();
      socket.on(event, (data: any) => handlerRef.current(data));
    };

    connect();

    return () => {
      if (socket) {
        socket.off(event);
      }
    };
  }, deps);
};

export const useRoomSocket = (
  roomId: string,
  onMessage: (data: any) => void,
  currentUserId?: string | null,
) => {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    let socket: Socket | null = null;

    const connect = async () => {
      try {
        socket = await getSocket();
        if (!socket) return;
        socket.emit("joinRoom", roomId);
        socket.on("roomMessage", (data: any) => {
          onMessageRef.current(data);
        });
      } catch (error) {
        console.log("소켓 연결 실패:", error);
      }
    };

    connect();

    return () => {
      if (socket) {
        socket.emit("leaveRoom", roomId);
        socket.off("roomMessage");
      }
    };
  }, [roomId]);
};

export const useGlobalSocket = (currentUserId: string | null) => {
  useEffect(() => {
    if (!currentUserId) return;

    let s: Socket | null = null;

    const connect = async () => {
      s = await getSocket();

      // 새 쪽지 토스트
      s.on("directMessage", (data: any) => {
        if (data.recipientId === currentUserId) {
          Toast.show({
            type: "info",
            text1: `${data.sender?.name || "누군가"}님의 쪽지`,
            text2: data.content,
            visibilityTime: 3000,
            position: "top",
          });
        }
      });

      // 새 알림 토스트
      s.on("notification", (data: any) => {
        Toast.show({
          type: "success",
          text1: data.title,
          text2: data.message,
          visibilityTime: 3000,
          position: "top",
        });
      });

      // 채팅방 메시지 토스트
      s.on("globalRoomMessage", (data: any) => {
        if (data.senderId !== currentUserId) {
          Toast.show({
            type: "info",
            text1: `${data.sender?.name || "누군가"}`,
            text2: data.content,
            visibilityTime: 3000,
            position: "top",
          });
        }
      });
    };

    connect();

    return () => {
      if (s) {
        s.off("directMessage");
        s.off("notification");
        s.off("globalRoomMessage");
      }
    };
  }, [currentUserId]);
};
