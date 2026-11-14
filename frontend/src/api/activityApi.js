import axiosClient from "./axiosClient.js";

export const getActivity = (projectId) =>
    axiosClient.get(`/projects/${projectId}/activity`);