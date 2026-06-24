import { useEffect, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://dev-pms-backend-production.up.railway.app/api";

export const useSSE = (endpoint: string, onMessage: (data: any) => void) => {
  const eventSourceRef = useRef<any>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return;

      const url = `${API_URL}${endpoint}`;

      // EventSource 대신 fetch + ReadableStream 방식 사용
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      eventSourceRef.current = reader;

      const read = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const jsonStr = line.slice(6).trim();
                  if (jsonStr) {
                    const data = JSON.parse(jsonStr);
                    onMessageRef.current(data);
                  }
                } catch (e) {
                  // JSON 파싱 실패 무시
                }
              }
            }
          }
        } catch (error) {
          console.log("SSE 읽기 오류:", error);
        }
      };

      read();
    } catch (error) {
      console.log("SSE 연결 실패:", error);
    }
  }, [endpoint]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.cancel();
      }
    };
  }, [connect]);
};
