import axiosClient from "./axiosClient";

export const getTasks = (projectId, status) =>
    axiosClient.get(`/projects/${projectId}/tasks`, {
        params: status ? { status } : {},
    });

export const createTask = (projectId, task) =>
    axiosClient.post(`/projects/${projectId}/tasks`, task);

export const updateTask = (id, task) => axiosClient.put(`/tasks/${id}`, task);

export const updateTaskStatus = (id, status) =>
    axiosClient.patch(`/tasks/${id}/status`, null, { params: { status } });

export const deleteTask = (id) => axiosClient.delete(`/tasks/${id}`);

export const assignTask = (id, userId) =>
    axiosClient.patch(`/tasks/${id}/assignee`, null, {
        params: userId ? { userId } : {},   // no userId means "unassign"
    });