import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useNavigation } from "@react-navigation/native";
import { registerDeviceToken } from "../api/deviceToken";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const usePushNotification = () => {
  const navigation = useNavigation<any>();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  const registerForPushNotifications = async () => {
    if (!Device.isDevice) {
      console.log("실기기에서만 푸시 알림이 동작합니다");
      return;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("푸시 알림 권한이 거부됐습니다");
      return;
    }

    const token = await Notifications.getDevicePushTokenAsync();
    await registerDeviceToken(token.data);
  };

  useEffect(() => {
    registerForPushNotifications();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("알림 수신:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log("알림 탭:", data);

        // 알림 타입에 따라 화면 이동
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
    };
  }, []);
};
