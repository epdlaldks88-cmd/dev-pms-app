import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
) => {
  useEffect(() => {
    let socket: Socket | null = null;

    const connect = async () => {
      socket = await getSocket();
      socket.emit("joinRoom", roomId);
      socket.on("roomMessage", (data: any) => {
        if (data.roomId === roomId) {
          onMessage(data);
        }
      });
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
