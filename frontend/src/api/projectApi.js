import axiosClient from "./axiosClient.js";

export const getProjects = () => axiosClient.get("/projects");

export const createProject = (project) => axiosClient.post("/projects", project);

export const deleteProject = (id) => axiosClient.delete(`/projects/${id}`);