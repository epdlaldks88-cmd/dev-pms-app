import { apiClient } from "./client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getMyTasks = async () => {
  const userId = await AsyncStorage.getItem("userId");

  const projectsRes = await apiClient.get("/projects");
  const projects = projectsRes.data;

  const taskPromises = projects.map((project: any) =>
    apiClient
      .get(`/projects/${project.id}/tasks`, {
        params: { assigneeId: userId },
      })
      .then((res) =>
        res.data.map((task: any) => ({
          ...task,
          project: { name: project.name, color: project.color }, // 프로젝트 정보 직접 붙이기
        })),
      )
      .catch(() => []),
  );

  const taskArrays = await Promise.all(taskPromises);
  return taskArrays.flat();
};

export const getTaskDetail = async (taskId: string) => {
  const response = await apiClient.get(`/tasks/${taskId}`);
  const task = response.data;

  // projectId로 프로젝트 정보 가져오기
  if (task.projectId) {
    try {
      const projectRes = await apiClient.get(`/projects/${task.projectId}`);
      task.project = {
        name: projectRes.data.name,
        color: projectRes.data.color,
      };
    } catch (e) {}
  }

  return task;
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
