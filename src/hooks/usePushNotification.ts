import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";
import { registerDeviceToken } from "../api/deviceToken";

// FCM 토큰 캐싱 (logout 시 해제용)
let cachedFcmToken: string | null = null;
export const getCurrentFcmToken = () => cachedFcmToken;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Expo Go 판별 (SenderId mismatch 방지용)
const isExpoGo = Constants.appOwnership === "expo";

export const usePushNotification = () => {
  const navigation = useNavigation<any>();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const tokenListener = useRef<Notifications.Subscription | null>(null);

  const registerForPushNotifications = async () => {
    // 실기기가 아니면 스킵 (에뮬레이터/시뮬레이터)
    if (!Device.isDevice) {
      if (__DEV__) console.log("[push] not a physical device, skip");
      return;
    }

    // Expo Go에서는 FCM 토큰 발급/등록 스킵 (SenderId mismatch 방지)
    if (isExpoGo) {
      if (__DEV__) console.log("[push] running in Expo Go, FCM not supported");
      return;
    }

    // 안드로이드 알림 채널 설정 (Android 8.0+ 필수)
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    // 권한 요청
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      if (__DEV__) console.log("[push] permission denied");
      return;
    }

    try {
      const token = await Notifications.getDevicePushTokenAsync();
      cachedFcmToken = token.data;
      await registerDeviceToken(token.data);
      if (__DEV__) console.log("[push] registered:", token.data.slice(0, 20));
    } catch (e) {
      if (__DEV__) console.log("[push] register failed", e);
    }
  };

  useEffect(() => {
    registerForPushNotifications();

    // 토큰 갱신 감지 (FCM이 새 토큰 발급할 때)
    tokenListener.current = Notifications.addPushTokenListener(
      async (token) => {
        if (__DEV__) console.log("[push] token changed");
        cachedFcmToken = token.data;
        try {
          await registerDeviceToken(token.data);
        } catch (e) {
          if (__DEV__) console.log("[push] re-register failed");
        }
      },
    );

    // 포그라운드 알림 수신
    notificationListener.current =
      Notifications.addNotificationReceivedListener(() => {
        // 필요 시 처리. 로그는 가드.
        if (__DEV__) console.log("[push] received");
      });

    // 알림 탭 → 화면 이동
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (__DEV__) console.log("[push] tapped type:", data?.type);

        if (data?.type === "TASK_ASSIGNED" || data?.type === "TASK_UPDATED") {
          const link = data?.link as string;
          if (link) {
            const taskId = link.split("/").pop();
            if (taskId) navigation.navigate("TaskDetail", { taskId });
          }
        } else if (data?.type === "MEETING_CREATED") {
          navigation.navigate("MainTab", { screen: "Meetings" });
        } else {
          navigation.navigate("MainTab", { screen: "Notifications" });
        }
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
      tokenListener.current?.remove();
    };
  }, []);
};
