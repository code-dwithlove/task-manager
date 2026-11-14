import axiosClient from "./axiosClient";

export const getMembers = (projectId) =>
    axiosClient.get(`/projects/${projectId}/members`);

export const addMember = (projectId, email) =>
    axiosClient.post(`/projects/${projectId}/members`, { email });

export const removeMember = (projectId, userId) =>
    axiosClient.delete(`/projects/${projectId}/members/${userId}`);