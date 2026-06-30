import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { AppState, AppStateStatus } from "react-native";
import Toast from "react-native-toast-message";
import { tokenStorage } from "../lib/storage";

const SOCKET_URL = "https://dev-pms-backend-production.up.railway.app";

// === 소켓 매니저 ===
let socket: Socket | null = null;
let connectingPromise: Promise<Socket | null> | null = null;

// 재연결 시 복원할 채팅방들
const joinedRooms = new Set<string>();

// 재연결 시 호출될 콜백들 (각 화면이 catch-up용으로 등록)
type ReconnectCallback = () => void;
const reconnectCallbacks = new Set<ReconnectCallback>();

export const onSocketReconnect = (cb: ReconnectCallback) => {
  reconnectCallbacks.add(cb);
  return () => {
    reconnectCallbacks.delete(cb);
  };
};

const setupSocketListeners = (s: Socket) => {
  s.on("connect", () => {
    if (__DEV__) console.log("[socket] connected:", s.id);
    // joined rooms 복원
    joinedRooms.forEach((roomId) => s.emit("joinRoom", roomId));
    // 재연결 콜백 실행 (배지 새로고침 등)
    reconnectCallbacks.forEach((cb) => {
      try {
        cb();
      } catch {}
    });
  });

  s.on("disconnect", (reason) => {
    if (__DEV__) console.log("[socket] disconnect:", reason);
  });

  s.on("connect_error", async (err: any) => {
    if (__DEV__) console.log("[socket] connect_error:", err?.message);

    // 인증 에러면 최신 토큰으로 auth 갱신 (다음 재시도가 새 토큰 사용)
    const msg = String(err?.message || "").toLowerCase();
    if (
      msg.includes("auth") ||
      msg.includes("token") ||
      msg.includes("unauthorized")
    ) {
      const newToken = await tokenStorage.getAccessToken();
      if (newToken && s.auth) {
        (s.auth as any).token = newToken;
      }
    }
  });
};

const createSocket = async (): Promise<Socket | null> => {
  const token = await tokenStorage.getAccessToken();
  if (!token) return null;

  const s = io(`${SOCKET_URL}/chat`, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity, // 모바일은 무한 재시도
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000, // 백오프 상한 10초
    timeout: 20000,
  });

  setupSocketListeners(s);
  return s;
};

export const getSocket = async (): Promise<Socket | null> => {
  if (socket?.connected) return socket;

  // 인스턴스는 있는데 끊긴 상태 → 재연결 시도
  if (socket && !socket.connected) {
    socket.connect();
    return socket;
  }

  // 동시 호출 방지
  if (connectingPromise) return connectingPromise;

  connectingPromise = (async () => {
    const s = await createSocket();
    socket = s;
    connectingPromise = null;
    return s;
  })();

  return connectingPromise;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  joinedRooms.clear();
  reconnectCallbacks.clear();
};

// === AppState: 포그라운드 복귀 시 소켓 점검 ===
let appStateSub: { remove: () => void } | null = null;

const handleAppStateChange = (state: AppStateStatus) => {
  if (state === "active" && socket && !socket.connected) {
    if (__DEV__) console.log("[socket] app active, reconnecting");
    socket.connect();
  }
};

export const initSocketAppStateListener = () => {
  if (appStateSub) return;
  appStateSub = AppState.addEventListener("change", handleAppStateChange);
};

export const cleanupSocketAppStateListener = () => {
  if (appStateSub) {
    appStateSub.remove();
    appStateSub = null;
  }
};

// === Hooks ===

export const useSocket = (
  event: string,
  handler: (data: any) => void,
  deps: any[] = [],
) => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    let s: Socket | null = null;
    let mounted = true;

    // ⭐ 안정적인 핸들러 참조 (cleanup 시 정확히 이 함수만 제거)
    const stableHandler = (data: any) => handlerRef.current(data);

    const connect = async () => {
      s = await getSocket();
      if (!mounted || !s) return;
      s.on(event, stableHandler);
    };

    connect();

    return () => {
      mounted = false;
      if (s) {
        s.off(event, stableHandler); // ⭐ 특정 핸들러만 제거
      }
    };
  }, deps);
};

export const useRoomSocket = (
  roomId: string,
  onMessage: (data: any) => void,
) => {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!roomId) return;
    let s: Socket | null = null;
    let mounted = true;

    const stableHandler = (data: any) => onMessageRef.current(data);

    const connect = async () => {
      try {
        s = await getSocket();
        if (!mounted || !s) return;
        s.emit("joinRoom", roomId);
        joinedRooms.add(roomId); // 재연결 복원용
        s.on("roomMessage", stableHandler);
      } catch (error) {
        if (__DEV__) console.log("[useRoomSocket] failed:", error);
      }
    };

    connect();

    return () => {
      mounted = false;
      if (s) {
        s.emit("leaveRoom", roomId);
        s.off("roomMessage", stableHandler);
      }
      joinedRooms.delete(roomId);
    };
  }, [roomId]);
};

export const useGlobalSocket = (currentUserId: string | null) => {
  useEffect(() => {
    if (!currentUserId) return;
    let s: Socket | null = null;
    let mounted = true;

    const onDirect = (data: any) => {
      if (data.recipientId === currentUserId) {
        Toast.show({
          type: "info",
          text1: `${data.sender?.name || "누군가"}님의 쪽지`,
          text2: data.content,
          visibilityTime: 3000,
          position: "top",
        });
      }
    };
    const onNoti = (data: any) => {
      Toast.show({
        type: "success",
        text1: data.title,
        text2: data.message,
        visibilityTime: 3000,
        position: "top",
      });
    };
    const onGlobalRoom = (data: any) => {
      if (data.senderId !== currentUserId) {
        Toast.show({
          type: "info",
          text1: `${data.sender?.name || "누군가"}`,
          text2: data.content,
          visibilityTime: 3000,
          position: "top",
        });
      }
    };

    const connect = async () => {
      s = await getSocket();
      if (!mounted || !s) return;
      s.on("directMessage", onDirect);
      s.on("notification", onNoti);
      s.on("globalRoomMessage", onGlobalRoom);
    };

    connect();

    return () => {
      mounted = false;
      if (s) {
        s.off("directMessage", onDirect);
        s.off("notification", onNoti);
        s.off("globalRoomMessage", onGlobalRoom);
      }
    };
  }, [currentUserId]);
};
