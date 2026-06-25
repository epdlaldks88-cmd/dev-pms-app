import { useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EventSource from "react-native-sse";

const API_URL = "https://dev-pms-backend-production.up.railway.app/api";

export const useSSE = (
  endpoint: string,
  onMessage: (data: any) => void,
  enabled: boolean = true,
) => {
  const esRef = useRef<EventSource | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!enabled) return;

    let es: EventSource | null = null;

    const connect = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) return;

        es = new EventSource(`${API_URL}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        esRef.current = es;

        es.addEventListener("message", (event: any) => {
          try {
            if (event.data) {
              const data = JSON.parse(event.data);
              onMessageRef.current(data);
            }
          } catch (e) {
            // JSON 파싱 실패 무시
          }
        });

        es.addEventListener("error", (event: any) => {
          console.log("SSE 에러:", endpoint, event);
          // 5초 후 재연결
          setTimeout(() => {
            if (es) {
              es.close();
              connect();
            }
          }, 5000);
        });

        es.addEventListener("open", () => {
          console.log("SSE 연결됨:", endpoint);
        });
      } catch (error) {
        console.log("SSE 연결 실패:", error);
      }
    };

    connect();

    return () => {
      if (es) {
        es.close();
        esRef.current = null;
      }
    };
  }, [endpoint, enabled]);
};
