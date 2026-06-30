import React, { useState, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { ThemeProvider, useTheme } from "./src/theme/ThemeContext";
import LoginScreen from "./src/screens/LoginScreen";
import NotificationsScreen from "./src/screens/NotificationsScreen";
import ProjectsScreen from "./src/screens/ProjectsScreen";
import TasksScreen from "./src/screens/TasksScreen";
import TaskDetailScreen from "./src/screens/TaskDetailScreen";
import MeetingsScreen from "./src/screens/MeetingsScreen";
import MeetingDetailScreen from "./src/screens/MeetingDetailScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import MessagesScreen from "./src/screens/MessagesScreen";
import MessageThreadScreen from "./src/screens/MessageThreadScreen";
import NewMessageScreen from "./src/screens/NewMessageScreen";
import RoomsScreen from "./src/screens/RoomsScreen";
import RoomChatScreen from "./src/screens/RoomChatScreen";
import SplashScreen from "./src/screens/SplashScreen";
import { useBadge } from "./src/hooks/useBadge";
import ProjectDetailScreen from "./src/screens/ProjectDetailScreen";
import SearchScreen from "./src/screens/SearchScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ChatScreen from "./src/screens/ChatScreen";
import NoticesScreen from "./src/screens/NoticesScreen";
import NoticeDetailScreen from "./src/screens/NoticeDetailScreen";
import QAScreen from "./src/screens/QAScreen";
import OfflineBanner from "./src/components/OfflineBanner";
import IssuesScreen from "./src/screens/IssuesScreen";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { setNavigationRef } from "./src/api/client";
import Toast from "react-native-toast-message";
import { useGlobalSocket } from "./src/hooks/useSocket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CreateTaskScreen from "./src/screens/CreateTaskScreen";
import CreateMeetingScreen from "./src/screens/CreateMeetingScreen";
import CreateIssueScreen from "./src/screens/CreateIssueScreen";
import { BadgeProvider } from "./src/hooks/useBadge";
import { migrateTokensIfNeeded } from "./src/lib/storage";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import {
  initSocketAppStateListener,
  cleanupSocketAppStateListener,
} from "./src/hooks/useSocket";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const navigationContainerRef = createNavigationContainerRef();

function TabNavigator() {
  const { primary, colors } = useTheme();
  const { notificationCount, messageCount } = useBadge();
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("userId").then(setMyId);
  }, []);

  useEffect(() => {
    migrateTokensIfNeeded();
  }, []);

  useGlobalSocket(myId);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "홈",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: "메시지",
          tabBarBadge: messageCount > 0 ? messageCount : undefined,
          tabBarBadgeStyle: { backgroundColor: primary },
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: "알림",
          tabBarBadge: notificationCount > 0 ? notificationCount : undefined,
          tabBarBadgeStyle: { backgroundColor: primary },
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "notifications" : "notifications-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "마이페이지",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer
      ref={navigationContainerRef}
      onReady={() => setNavigationRef(navigationContainerRef)}
    >
      <OfflineBanner />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTab" component={TabNavigator} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
        <Stack.Screen name="MeetingDetail" component={MeetingDetailScreen} />
        <Stack.Screen name="MessageThread" component={MessageThreadScreen} />
        <Stack.Screen name="NewMessage" component={NewMessageScreen} />
        <Stack.Screen name="RoomChat" component={RoomChatScreen} />
        <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Notices" component={NoticesScreen} />
        <Stack.Screen name="NoticeDetail" component={NoticeDetailScreen} />
        <Stack.Screen name="QA" component={QAScreen} />
        <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
        <Stack.Screen name="CreateMeeting" component={CreateMeetingScreen} />
        <Stack.Screen name="CreateIssue" component={CreateIssueScreen} />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    initSocketAppStateListener();
    return () => cleanupSocketAppStateListener();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BadgeProvider>
          <AppNavigator />
        </BadgeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
