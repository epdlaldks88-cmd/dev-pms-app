export default {
  expo: {
    name: "dev-pms-app",
    slug: "dev-pms-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
      dark: {
        image: "./assets/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#111827",
      },
    },
    androidStatusBar: {
      barStyle: "light-content",
      backgroundColor: "#e60012",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.epdlaldks.devpmsapp",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#e60012",
      },
      package: "com.epdlaldks.devpmsapp",
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? "$GOOGLE_SERVICES_JSON",
      permissions: [
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "POST_NOTIFICATIONS",
        "VIBRATE",
        "WAKE_LOCK",
      ],
    },
    notification: {
      icon: "./assets/icon.png",
      color: "#e60012",
      androidMode: "default",
      androidCollapsedTitle: "PMS 알림",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      eas: {
        projectId: "f6881496-e1e7-406a-9dcc-6f1e445cb73f",
      },
    },
    plugins: [
      "@react-native-community/datetimepicker",
      "expo-secure-store",
      [
        "expo-notifications",
        {
          icon: "./assets/icon.png",
          color: "#e60012",
          defaultChannel: "default",
        },
      ],
    ],
  },
};
