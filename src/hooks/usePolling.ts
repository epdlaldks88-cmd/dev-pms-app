import { useEffect, useRef } from "react";

export const usePolling = (callback: () => void, interval: number = 3000) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const timer = setInterval(() => {
      callbackRef.current();
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);
};
