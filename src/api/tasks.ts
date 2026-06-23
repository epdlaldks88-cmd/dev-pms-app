import { apiClient } from "./client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getMyTasks = async () => {
  const userId = await AsyncStorage.getItem("userId");

  // 내가 속한 프로젝트 목록 가져오기
  const projectsRes = await apiClient.get("/projects");
  const projects = projectsRes.data;

  // 각 프로젝트에서 내 태스크 가져오기
  const taskPromises = projects.map((project: any) =>
    apiClient
      .get(`/projects/${project.id}/tasks`, {
        params: { assigneeId: userId },
      })
      .then((res) => res.data)
      .catch(() => []),
  );

  const taskArrays = await Promise.all(taskPromises);
  return taskArrays.flat();
};

export const getTaskDetail = async (taskId: string) => {
  const response = await apiClient.get(`/tasks/${taskId}`);
  return response.data;
};

export const updateTaskStatus = async (taskId: string, status: string) => {
  const task = await getTaskDetail(taskId);
  const response = await apiClient.patch(
    `/projects/${task.projectId}/tasks/${taskId}`,
    { status },
  );
  return response.data;
};

export const getComments = async (taskId: string) => {
  const response = await apiClient.get(`/tasks/${taskId}/comments`);
  return response.data;
};

export const createComment = async (taskId: string, content: string) => {
  const response = await apiClient.post(`/tasks/${taskId}/comments`, {
    content,
  });
  return response.data;
};
