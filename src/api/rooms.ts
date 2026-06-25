import { apiClient } from "./client";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://dev-pms-backend-production.up.railway.app/api";

// 채팅 전용 axios 인스턴스 (SSE와 분리)
const chatClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

chatClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const sendRoomMessage = async (roomId: string, content: string) => {
  const response = await chatClient.post(`/rooms/${roomId}/messages`, {
    content,
  });
  return response.data;
};

export const getMyRooms = async () => {
  const response = await apiClient.get("/rooms");
  return response.data;
};

export const createRoom = async (name: string, memberIds: string[]) => {
  const response = await apiClient.post("/rooms", { name, memberIds });
  return response.data;
};

export const getRoomMessages = async (roomId: string) => {
  const response = await apiClient.get(`/rooms/${roomId}/messages`);
  return response.data;
};

export const addRoomMember = async (roomId: string, userId: string) => {
  const response = await apiClient.post(`/rooms/${roomId}/members`, { userId });
  return response.data;
};

export const renameRoom = async (roomId: string, name: string) => {
  const response = await apiClient.patch(`/rooms/${roomId}/name`, { name });
  return response.data;
};

export const leaveRoom = async (roomId: string) => {
  const response = await apiClient.delete(`/rooms/${roomId}/members/me`);
  return response.data;
};
