import { apiClient } from "./client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getMyTasks = async (page: number = 1, limit: number = 20) => {
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
          project: { name: project.name, color: project.color },
        })),
      )
      .catch(() => []),
  );

  const taskArrays = await Promise.all(taskPromises);
  const allTasks = taskArrays.flat();

  // 클라이언트 사이드 페이지네이션
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    data: allTasks.slice(start, end),
    total: allTasks.length,
    hasMore: end < allTasks.length,
  };
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

export const updateTask = async (
  taskId: string,
  data: {
    title?: string;
    description?: string;
    startDate?: string;
    dueDate?: string;
    priority?: string;
  },
) => {
  const task = await getTaskDetail(taskId);
  const response = await apiClient.patch(
    `/projects/${task.projectId}/tasks/${taskId}`,
    data,
  );
  return response.data;
};

export const createTask = async (
  projectId: string,
  data: {
    title: string;
    description?: string;
    priority?: string;
    startDate?: string;
    dueDate?: string;
    stepId?: string;
    assigneeIds?: string[];
  },
) => {
  const response = await apiClient.post(`/projects/${projectId}/tasks`, data);
  return response.data;
};

export const getProjectSteps = async (projectId: string) => {
  const response = await apiClient.get(`/projects/${projectId}/steps`);
  return response.data;
};
