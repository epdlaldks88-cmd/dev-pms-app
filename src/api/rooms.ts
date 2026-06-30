import { apiClient } from "./client";

export const sendRoomMessage = async (roomId: string, content: string) => {
  const response = await apiClient.post(`/rooms/${roomId}/messages`, {
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

export const getRoomDetail = async (roomId: string) => {
  const response = await apiClient.get(`/rooms/${roomId}/messages`);
  return response.data.room;
};

export const getRoomsUnreadTotal = async () => {
  const rooms = await getMyRooms();
  return rooms.reduce((sum: number, r: any) => sum + (r.unreadCount || 0), 0);
};
