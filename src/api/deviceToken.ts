import { apiClient } from "./client";
import * as Device from "expo-device";

export const registerDeviceToken = async (fcmToken: string) => {
  const platform = Device.osName?.toLowerCase().includes("android")
    ? "android"
    : "ios";
  return apiClient.post("/device-tokens/register", {
    token: fcmToken,
    platform,
  });
};

export const removeDeviceToken = async (fcmToken: string) => {
  return apiClient.delete(`/device-tokens/${fcmToken}`);
};
