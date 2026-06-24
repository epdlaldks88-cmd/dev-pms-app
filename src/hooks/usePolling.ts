import { useEffect, useRef, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";

export const usePolling = (
  callback: () => void,
  interval: number = 3000,
  enabled: boolean = true,
) => {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>("active");
  callbackRef.current = callback;

  const startPolling = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (appStateRef.current === "active") {
        callbackRef.current();
      }
    }, interval);
  }, [interval]);

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      stopPolling();
      return;
    }

    startPolling();

    // 앱이 백그라운드로 가면 폴링 중단, 포그라운드로 오면 재시작
    const subscription = AppState.addEventListener("change", (nextState) => {
      appStateRef.current = nextState;
      if (nextState === "active") {
        startPolling();
      } else {
        stopPolling();
      }
    });

    return () => {
      stopPolling();
      subscription.remove();
    };
  }, [interval, enabled, startPolling, stopPolling]);
};
