import axiosClient from "./axiosClient.js";

export const suggestTasks = (projectId, data) =>
    axiosClient.post(`/projects/${projectId}/ai/breakdown`, data);