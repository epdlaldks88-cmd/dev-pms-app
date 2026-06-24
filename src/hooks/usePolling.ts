import { useEffect, useRef } from "react";

export const usePolling = (
  callback: () => void,
  interval: number = 3000,
  enabled: boolean = true,
) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(() => {
      callbackRef.current();
    }, interval);

    return () => clearInterval(timer);
  }, [interval, enabled]);
};
